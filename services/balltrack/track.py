"""Ball tracking for the goal / assist video stories (GameDayImageMaker).

  detect <video> <out_det.json> <out_poster.jpg>
      YOLO ("sports ball", COCO class 32) on every frame at a high input size (the ball is tiny in wide
      shots), shot cuts (colour histogram jumps), static detections dropped (overlays, logos). Writes
      {fps, W, H, n, shots: [[a, b]], cands: [[[x, y, conf], ...] per frame]} and the first frame as JPEG.
      Prints "progress i/n" lines for the app's progress bar.

  render <video> <path.json> <out.mp4> [--esrgan]
      path.json = {start, end, zoom, outW, outH, x: [...], y: [...]} (frames, per-frame centre). Crops the
      window around each centre (same formula as src/lib/clips/path.ts cropRect, at sub-pixel positions),
      at 60 fps with RIFE frames between the source's real ones, optionally upscaled by Real-ESRGAN, resized
      to outW×outH (Lanczos) and writes the frames (no audio: ffmpeg adds it when composing the story).
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import cv2
import numpy as np


def read_frames(path):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    return fps, frames


def detect(video, out_json, out_poster):
    from ultralytics import YOLO
    import torch

    fps, frames = read_frames(video)
    n = len(frames)
    if not n:
        raise SystemExit("vídeo sem imagens")
    H, W = frames[0].shape[:2]
    cv2.imwrite(out_poster, frames[0], [cv2.IMWRITE_JPEG_QUALITY, 90])
    model = YOLO(__file__.rsplit("/", 1)[0] + "/yolo11l.pt")
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    cands = []
    for i in range(0, n, 16):
        for r in model.predict(frames[i : i + 16], imgsz=1280, conf=0.03, classes=[32], device=device, verbose=False):
            cands.append([[(b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b[2] - b[0], c] for b, c in zip(r.boxes.xyxy.tolist(), r.boxes.conf.tolist())])
        print(f"progress {min(i + 16, n)}/{n}", flush=True)

    def hist(f):
        h = cv2.calcHist([cv2.cvtColor(f, cv2.COLOR_BGR2HSV)], [0, 1], None, [32, 32], [0, 180, 0, 256])
        return cv2.normalize(h, h).flatten()

    hs = [hist(f) for f in frames]
    cuts = [0] + [i for i in range(1, n) if cv2.compareHist(hs[i - 1], hs[i], cv2.HISTCMP_BHATTACHARYYA) > 0.45] + [n]
    shots = [[a, b] for a, b in zip(cuts, cuts[1:]) if b > a]

    flat = np.array([[c[0], c[1]] for cs in cands for c in cs]) if any(cands) else np.zeros((0, 2))

    def static(c):
        if not len(flat):
            return False
        same = np.sum((np.abs(flat[:, 0] - c[0]) < 3) & (np.abs(flat[:, 1] - c[1]) < 3))
        return same > 0.25 * n

    clean = [[[round(c[0], 1), round(c[1], 1), round(c[3], 3)] for c in cs if c[2] < 0.08 * W and not static(c)] for cs in cands]
    json.dump({"fps": fps, "W": W, "H": H, "n": n, "shots": shots, "cands": clean}, open(out_json, "w"))


OUT_FPS = 60
SERVICES = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RIFE = os.path.join(SERVICES, "interp", "bin", "rife-ncnn-vulkan")
RIFE_MODEL = os.path.join(SERVICES, "interp", "bin", "rife-v4.6")
ESRGAN = os.path.join(SERVICES, "upscale", "bin", "realesrgan-ncnn-vulkan")


def real_frames(video, fps, n):
    """Indices of the frames whose image really changes. Phone / WhatsApp clips are often ~24 fps stored
    as 60 fps: each image repeated 2 or 3 times (more where frames were dropped), so the motion moves in
    uneven 2-3-2-3 steps. ffmpeg's mpdecimate drops the repeats."""
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "mpdecimate,showinfo", "-f", "null", "-"], capture_output=True, text=True).stderr
    real = sorted({min(n - 1, round(float(t) * fps)) for t in re.findall(r"pts_time:([0-9.]+)", log)})
    return real if real and real[0] == 0 else [0] + real


def render(video, path_json, out, esrgan=False):
    """The ball-following crop at 60 fps: every output frame is a real frame or one RIFE makes between the
    two real frames around it, the window is cropped at sub-pixel positions (it glides instead of stepping a
    source pixel at a time) and, with esrgan, the small crop is upscaled by Real-ESRGAN before the resize."""
    p = json.load(open(path_json))
    fps, frames = read_frames(video)
    n = len(frames)
    H, W = frames[0].shape[:2]
    real = real_frames(video, fps, n)
    z = max(1.0, float(p["zoom"]))
    w, h = round(W / z), round(H / z)
    ow, oh = int(p["outW"]), int(p["outH"])
    # Crop to the slot's aspect (the slot may differ slightly from the source's 16:9).
    target = ow / oh
    if w / h > target:
        w = round(h * target)
    else:
        h = round(w / target)
    px, py = np.array(p["x"], float), np.array(p["y"], float)
    start, end = int(p["start"]), min(int(p["end"]), n)
    count = int((end - start) / fps * OUT_FPS)

    with tempfile.TemporaryDirectory() as work:
        src = lambda i: os.path.join(work, f"s{i}.png")
        crops = os.path.join(work, "crop")
        os.makedirs(crops)
        for k in range(count):
            s = start + k * fps / OUT_FPS  # position in source frames
            a = max(r for r in real if r <= s)
            b = next((r for r in real if r > s), None)
            if b is None or s - a < 1e-3:
                img = frames[a]
            else:
                for i in (a, b):
                    if not os.path.exists(src(i)):
                        cv2.imwrite(src(i), frames[i])
                mid = os.path.join(work, "mid.png")
                subprocess.run([RIFE, "-0", src(a), "-1", src(b), "-o", mid, "-m", RIFE_MODEL, "-s", f"{(s - a) / (b - a):.4f}"], check=True, capture_output=True)
                img = cv2.imread(mid)
            i0 = min(int(s), n - 1)
            i1 = min(i0 + 1, n - 1)
            t = s - i0
            cx = min(max(px[i0] * (1 - t) + px[i1] * t, w / 2), W - w / 2)
            cy = min(max(py[i0] * (1 - t) + py[i1] * t, h / 2), H - h / 2)
            cv2.imwrite(os.path.join(crops, f"{k:05d}.png"), cv2.getRectSubPix(img, (w, h), (cx - 0.5, cy - 0.5)))
            if k % 10 == 0:
                print(f"progress {k}/{count}", flush=True)
        if esrgan:
            up = os.path.join(work, "up")
            os.makedirs(up)
            subprocess.run([ESRGAN, "-i", crops, "-o", up, "-n", "realesrgan-x4plus", "-m", os.path.join(os.path.dirname(ESRGAN), "models"), "-f", "png"], check=True, capture_output=True)
            crops = up
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-framerate", str(OUT_FPS), "-i", os.path.join(crops, "%05d.png"),
            "-vf", f"scale={ow}:{oh}:flags=lanczos", "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p", out,
        ], check=True)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "detect":
        detect(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "render":
        render(sys.argv[2], sys.argv[3], sys.argv[4], "--esrgan" in sys.argv)
    else:
        raise SystemExit(f"comando desconhecido: {cmd}")
