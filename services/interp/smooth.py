"""Premium smoothing test for the video stories (prototype).

  smooth.py <clip_dir> <out.mp4> [--esrgan]

<clip_dir> is a clip's folder in data/files/clips/<id>/ after an export (source mp4, path.json, story.png).

1. The source's real frames: phone / WhatsApp clips are ~24 fps stored as 60 fps (each image repeated 2 or 3
   times, sometimes more where frames were dropped). ffmpeg's mpdecimate lists the frames that really change.
2. Every 60 fps output frame between two real frames a < i < b is made by RIFE at timestep (i-a)/(b-a):
   the motion advances evenly, 60 times a second, instead of in 2-3-2-3 steps.
3. The camera window is cropped at sub-pixel positions (cv2.getRectSubPix), so it glides instead of
   stepping one source pixel (= 1.85 output pixels at zoom 1.6) at a time.
4. Optional --esrgan: Real-ESRGAN x4 on the small crop before it is resized to the slot.
5. Same composition as src/lib/clips/export.ts: story.png + the crop over the slot + the source's audio.
"""
import glob
import json
import os
import re
import shutil
import subprocess
import sys

import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
RIFE = os.path.join(HERE, "bin", "rife-ncnn-vulkan")
ESRGAN_DIR = os.path.join(HERE, "..", "upscale", "bin")


def real_frames(src):
    """Indices (at the source's 60 fps) of the frames whose image actually changes."""
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vf", "mpdecimate,showinfo", "-f", "null", "-"], capture_output=True, text=True).stderr
    fps = cv2.VideoCapture(src).get(cv2.CAP_PROP_FPS)
    return sorted({round(float(t) * fps) for t in re.findall(r"pts_time:([0-9.]+)", log)})


def main(clip_dir, out, esrgan):
    src = next(f for f in glob.glob(os.path.join(clip_dir, "*.mp4")) if os.path.basename(f) not in ("crop.mp4", "out.mp4"))
    p = json.load(open(os.path.join(clip_dir, "path.json")))
    work = os.path.join(clip_dir, "smooth")
    shutil.rmtree(work, ignore_errors=True)
    for d in ("src", "mid", "crop", "up"):
        os.makedirs(os.path.join(work, d))

    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    H, W = frames[0].shape[:2]
    real = [i for i in real_frames(src) if i < len(frames)]
    print(f"{len(frames)} frames, {len(real)} reais", flush=True)

    # 2. One 60 fps frame per output index: a real frame as is, or RIFE between its two real neighbours.
    start, end = int(p["start"]), min(int(p["end"]), len(frames))
    images = {}
    for n, i in enumerate(range(start, end)):
        a = max([r for r in real if r <= i], default=real[0])
        b = min([r for r in real if r > i], default=None)
        if i == a or b is None:
            images[i] = frames[a]
            continue
        pa, pb, po = (os.path.join(work, "src", f"{k}.png") for k in (a, b, f"o{i}"))
        for k, path in ((a, pa), (b, pb)):
            if not os.path.exists(path):
                cv2.imwrite(path, frames[k])
        subprocess.run([RIFE, "-0", pa, "-1", pb, "-o", po, "-m", os.path.join(HERE, "bin", "rife-v4.6"), "-s", f"{(i - a) / (b - a):.4f}"], check=True, capture_output=True)
        images[i] = cv2.imread(po)
        if n % 20 == 0:
            print(f"rife {n}/{end - start}", flush=True)

    # 3. Sub-pixel crop (same window maths as track.py render, without the rounding).
    z = max(1.0, float(p["zoom"]))
    w, h = W / z, H / z
    ow, oh = int(p["outW"]), int(p["outH"])
    if w / h > ow / oh:
        w = h * ow / oh
    else:
        h = w * oh / ow
    cw, ch = int(round(w)), int(round(h))
    for i in range(start, end):
        cx = min(max(p["x"][i], cw / 2), W - cw / 2)
        cy = min(max(p["y"][i], ch / 2), H - ch / 2)
        crop = cv2.getRectSubPix(images[i], (cw, ch), (cx - 0.5, cy - 0.5))
        cv2.imwrite(os.path.join(work, "crop", f"{i - start:05d}.png"), crop)

    # 4. Optional Real-ESRGAN on the crops.
    frames_dir = os.path.join(work, "crop")
    if esrgan:
        print("real-esrgan…", flush=True)
        subprocess.run([os.path.join(ESRGAN_DIR, "realesrgan-ncnn-vulkan"), "-i", frames_dir, "-o", os.path.join(work, "up"), "-n", "realesrgan-x4plus", "-m", os.path.join(ESRGAN_DIR, "models"), "-f", "png"], check=True)
        frames_dir = os.path.join(work, "up")

    # 5. Compose like export.ts.
    slot = json.load(open(os.path.join(clip_dir, "slot.json"))) if os.path.exists(os.path.join(clip_dir, "slot.json")) else None
    sx, sy = (slot["x"], slot["y"]) if slot else (int(sys.argv[sys.argv.index("--slot") + 1]), int(sys.argv[sys.argv.index("--slot") + 2]))
    subprocess.run([
        "ffmpeg", "-y", "-v", "error",
        "-loop", "1", "-framerate", str(fps), "-i", os.path.join(clip_dir, "story.png"),
        "-framerate", str(fps), "-i", os.path.join(frames_dir, "%05d.png"),
        "-ss", str(start / fps), "-to", str(end / fps), "-i", src,
        "-filter_complex", f"[0:v]scale=1080:1920:flags=lanczos[bg];[1:v]scale={ow}:{oh}:flags=lanczos[c];[bg][c]overlay={sx}:{sy}:shortest=1,format=yuv420p[v]",
        "-map", "[v]", "-map", "2:a?",
        "-c:v", "libx264", "-profile:v", "high", "-crf", "16", "-preset", "slow",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out,
    ], check=True)
    print(f"pronto: {out}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], "--esrgan" in sys.argv)
