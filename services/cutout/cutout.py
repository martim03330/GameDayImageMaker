"""Prepare a player photo: upscale, remove the background, crop, locate the face.

Usage: cutout.py <input> <output.png> [model]

Steps
1. Small photos are upscaled 4x with Real-ESRGAN (services/upscale), blended with a
   plain Lanczos resize so skin texture stays natural and the face is never redrawn.
2. The segmentation model computes only the alpha channel; the player's pixels are
   copied untouched from the (upscaled) photo.
3. The face is located with YuNet so templates can build close-ups around it.

Prints one JSON line: {"width", "height", "upscaled", "face": [x, y, w, h] | null} (face in 0..1 of the cutout).
"""

import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import enhance  # noqa: E402
import pose  # noqa: E402
import others  # noqa: E402
import people  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ESRGAN = os.path.join(HERE, "..", "upscale", "bin", "realesrgan-ncnn-vulkan")
ESRGAN_MODELS = os.path.join(HERE, "..", "upscale", "bin", "models")
YUNET = os.path.join(HERE, "face_yunet.onnx")

TARGET_LONG_SIDE = 3000  # plenty for a 2160×2700 export
UPSCALE_BELOW = 2200
ESRGAN_WEIGHT = 0.82  # rest is Lanczos, keeps natural texture


def upscale(image: Image.Image) -> tuple[Image.Image, bool]:
    if max(image.size) >= UPSCALE_BELOW or not os.path.exists(ESRGAN):
        return image, False
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, "in.png"), os.path.join(tmp, "out.png")
        image.save(src)
        try:
            subprocess.run(
                [ESRGAN, "-i", src, "-o", dst, "-n", "realesrgan-x4plus", "-m", ESRGAN_MODELS],
                check=True,
                capture_output=True,
                timeout=600,
            )
            ai = Image.open(dst).convert("RGB")
        except Exception as e:  # GPU missing, etc.: fall back to a plain resize
            print(f"upscale failed: {e}", file=sys.stderr)
            return image, False
    plain = image.resize(ai.size, Image.LANCZOS)
    out = Image.blend(plain, ai, ESRGAN_WEIGHT)
    scale = TARGET_LONG_SIDE / max(out.size)
    if scale < 1:
        out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
    return out, True


def count_faces(image: Image.Image) -> int:
    """Faces at least 45% the size of the biggest one (background crowd faces don't count)."""
    try:
        import cv2
    except ImportError:
        return 1
    scale = 1200 / max(image.size)
    small = image.convert("RGB").resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))))
    det = cv2.FaceDetectorYN.create(YUNET, "", (small.width, small.height), 0.6)
    _, faces = det.detect(np.array(small)[:, :, ::-1].copy())
    if faces is None or len(faces) == 0:
        return 0
    biggest = max(f[2] * f[3] for f in faces)
    return int(sum(1 for f in faces if f[2] * f[3] >= 0.45 * 0.45 * biggest))


def count_people(mask: Image.Image) -> int:
    """Separate large blobs in the cutout mask: more than one means more than one person (or a stray banner)."""
    try:
        import cv2
    except ImportError:
        return 1
    m = np.array(mask.resize((max(1, mask.width // 4), max(1, mask.height // 4))))
    n, _, stats, _ = cv2.connectedComponentsWithStats((m > 128).astype(np.uint8), connectivity=8)
    areas = sorted((stats[i, cv2.CC_STAT_AREA] for i in range(1, n)), reverse=True)
    if not areas:
        return 0
    return int(sum(1 for a in areas if a >= 0.12 * areas[0]))


def find_face(image: Image.Image) -> list[float] | None:
    try:
        import cv2
    except ImportError:
        return None
    if not os.path.exists(YUNET):
        return None
    scale = 1200 / max(image.size)
    small = image.convert("RGB").resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))))
    bgr = np.array(small)[:, :, ::-1].copy()
    det = cv2.FaceDetectorYN.create(YUNET, "", (small.width, small.height), 0.6)
    _, faces = det.detect(bgr)
    if faces is None or len(faces) == 0:
        return None
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3] * f[14])[:4]
    return [float(x / small.width), float(y / small.height), float(w / small.width), float(h / small.height)]


def kit_colors(cutout: Image.Image, face: list[float] | None) -> list[str]:
    """Dominant colours of the shirt (the area under the face), to tell current-club photos apart."""
    w, h = cutout.size
    if face:
        fx, fy, fw, fh = face
        box = (int((fx - fw * 0.8) * w), int((fy + fh * 1.6) * h), int((fx + fw * 1.8) * w), int((fy + fh * 3.6) * h))
    else:
        box = (int(w * 0.25), int(h * 0.2), int(w * 0.75), int(h * 0.45))
    box = (max(0, box[0]), max(0, box[1]), min(w, box[2]), min(h, box[3]))
    if box[2] <= box[0] or box[3] <= box[1]:
        return []
    region = cutout.crop(box).convert("RGBA").resize((40, 40))
    px = [p[:3] for p in region.getdata() if p[3] > 200]
    if not px:
        return []
    q = Image.new("RGB", (len(px), 1))
    q.putdata(px)
    pal = q.quantize(colors=3, method=Image.Quantize.MEDIANCUT)
    counts = sorted(pal.getcolors(), reverse=True)
    palette = pal.getpalette()
    return ["#%02x%02x%02x" % tuple(palette[i * 3 : i * 3 + 3]) for _, i in counts]


def cut_edges(mask: Image.Image, bbox: tuple[int, int, int, int] | None) -> dict[str, float]:
    """Where the photo frame cuts the player (legs cut at the bottom, an arm at the side…):
    share of each crop edge covered by the subject when that edge is also the photo's edge."""
    if not bbox:
        return {}
    w, h = mask.size
    left, top, right, bottom = bbox
    px = mask.load()

    def cover(points: list[tuple[int, int]]) -> float:
        return sum(1 for x, y in points if px[x, y] > 128) / max(1, len(points))

    out: dict[str, float] = {}
    if top <= 0:
        out["top"] = cover([(x, 0) for x in range(left, right)])
    if bottom >= h:
        out["bottom"] = cover([(x, h - 1) for x in range(left, right)])
    if left <= 0:
        out["left"] = cover([(0, y) for y in range(top, bottom)])
    if right >= w:
        out["right"] = cover([(w - 1, y) for y in range(top, bottom)])
    # Normalise to the subject's own width / height so a thin arm still counts.
    return {k: round(min(1.0, v * 4), 3) for k, v in out.items() if v > 0.004}


def reference_faces(paths: list[str]) -> list:
    """SFace features of the player's face from his other photos (the biggest face in each)."""
    if not paths:
        return []
    import faces as facelib

    feats = []
    for p in paths[:4]:
        img = facelib.load(p)
        if img is None:
            continue
        found = facelib.faces(img)
        if found:
            feats.append(max(found, key=lambda x: x[0][2] * x[0][3])[1])
    return feats


def drop_intruders(mask: Image.Image) -> Image.Image:
    """Removes separate pieces that come in from the photo's edge: a reporter's hand and microphone,
    a team-mate's shoulder, a flag. The player's own blob and small bits near him (the ball) stay."""
    try:
        import cv2
    except ImportError:
        return mask
    m = (np.array(mask) > 128).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    if n <= 2:
        return mask
    H, W = m.shape
    main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    drop = np.zeros_like(m, dtype=bool)
    for i in range(1, n):
        if i == main:
            continue
        x, y, w, h, area = stats[i]
        touches_edge = x <= 2 or y <= 2 or x + w >= W - 2 or y + h >= H - 2
        if touches_edge and area > 0.004 * W * H:
            drop |= labels == i
    if not drop.any():
        return mask
    keep = np.array(mask)
    keep[cv2.dilate(drop.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0] = 0
    return Image.fromarray(keep)


def face_sharpness(cutout: Image.Image, face: list[float] | None, face_px: int) -> float | None:
    """Detail in the face at the size the camera captured it, brought to a 160px face. None without a face."""
    try:
        import cv2
    except ImportError:
        return None
    if not face or face_px < 8:
        return None
    W, H = cutout.size
    x, y, w, h = face[0] * W, face[1] * H, face[2] * W, face[3] * H
    box = (int(max(0, x + w * 0.15)), int(max(0, y + h * 0.1)), int(min(W, x + w * 0.85)), int(min(H, y + h * 0.9)))
    g = cv2.cvtColor(np.array(cutout.convert("RGB").crop(box)), cv2.COLOR_RGB2GRAY)
    # Down to the real captured size (AI upscaling must not count as detail), then to a common size.
    k = face_px / max(1, h)
    g = cv2.resize(g, (max(1, round(g.shape[1] * k)), max(1, round(g.shape[0] * k))), interpolation=cv2.INTER_AREA)
    k2 = 160 / face_px
    g = cv2.resize(g, (max(1, round(g.shape[1] * k2)), max(1, round(g.shape[0] * k2))), interpolation=cv2.INTER_CUBIC)
    lap = cv2.Laplacian(g.astype(np.float32), cv2.CV_32F)
    return float(np.sqrt((lap**2).mean()))


def sharpness(cutout: Image.Image, crop_h: int) -> float:
    """How much real detail the player has: Laplacian energy inside the matte, with the image scaled
    back to the size the camera actually captured him at (so AI upscaling doesn't fake a high score),
    then to a fixed 800px player height. Roughly: < 40 soft / blurred, > 90 crisp."""
    try:
        import cv2
    except ImportError:
        return 0.0
    rgba = np.array(cutout)
    alpha = rgba[:, :, 3]
    ys = np.where(alpha.max(1) > 128)[0]
    if len(ys) < 10:
        return 0.0
    player_h = ys[-1] - ys[0]
    native_h = max(1, round(player_h * min(1.0, crop_h / cutout.height)))
    gray = cv2.cvtColor(rgba[:, :, :3], cv2.COLOR_RGB2GRAY)
    # Down to the real captured size, then to a common size to compare photos with each other.
    k = native_h / player_h
    g = cv2.resize(gray, (max(1, round(gray.shape[1] * k)), max(1, round(gray.shape[0] * k))), interpolation=cv2.INTER_AREA)
    a = cv2.resize(alpha, (g.shape[1], g.shape[0]), interpolation=cv2.INTER_AREA)
    k2 = 800 / max(1, native_h)
    g = cv2.resize(g, (max(1, round(g.shape[1] * k2)), max(1, round(g.shape[0] * k2))), interpolation=cv2.INTER_CUBIC)
    a = cv2.resize(a, (g.shape[1], g.shape[0]))
    inner = cv2.erode((a > 200).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    lap = cv2.Laplacian(g, cv2.CV_32F)
    return float(np.sqrt((lap[inner] ** 2).mean())) if inner.any() else 0.0


def behind_points(image: Image.Image, face: list[float] | None, box: list[float], keep: list[list[int]]) -> list[list[int]]:
    """Points on the other people inside our player's box, found by their faces: each other face's centre
    and two points down its torso — skipped where they would land on one of his own joints."""
    try:
        import faces as facelib
    except Exception:  # noqa: BLE001
        return []
    W, H = image.size
    bgr = np.asarray(image.convert("RGB"))[:, :, ::-1].copy()
    found = [f for f, _ in facelib.faces(bgr)]
    if not found:
        return []
    mine = None
    if face:
        mx, my = (face[0] + face[2] / 2) * W, (face[1] + face[3] / 2) * H
        mine = min(found, key=lambda f: abs(f[0] + f[2] / 2 - mx) + abs(f[1] + f[3] / 2 - my))
    else:
        mine = max(found, key=lambda f: f[2] * f[3])
    out = []
    for f in found:
        if f is mine:
            continue
        cx, cy, fh = f[0] + f[2] / 2, f[1] + f[3] / 2, f[3]
        if not (box[0] <= cx <= box[2] and box[1] <= cy <= box[3]):
            continue
        # A much smaller face is far behind (crowd, bench): not touching him.
        if mine is not None and fh < 0.45 * mine[3]:
            continue
        for px, py in [(cx, cy), (cx, cy + 2.0 * fh), (cx, cy + 3.4 * fh)]:
            if not (0 <= px < W and 0 <= py < H):
                continue
            if any(abs(px - k[0]) + abs(py - k[1]) < 1.2 * fh for k in keep):
                continue
            out.append([int(px), int(py)])
    return out


def separate_people(image: Image.Image, mask: Image.Image, face: list[float] | None, person: list[float] | None, faces: int) -> Image.Image | None:
    """Only our player, when other people share the matte: people.keep_only from a point on his face (or high
    in his body box). None when nobody else is there, or when the result looks wrong (then the older
    isolate_main_person runs)."""
    W, H = image.size
    if face:
        keep = [[int((face[0] + face[2] / 2) * W), int((face[1] + face[3] / 2) * H)]]
    elif person:
        keep = [[int((person[0] + person[2]) / 2), int(person[1] + 0.2 * (person[3] - person[1]))]]
    else:
        return None
    matte = np.array(mask)
    solid = matte > 128
    dets = people.people_multi(image)
    # People actually in the matte (not the ones the matte already left out).
    inside = [d for d in dets if d["score"] >= 0.6 and (d["mask"] & solid).sum() > 0.3 * d["mask"].sum()]
    distinct: list = []
    for d in sorted(inside, key=lambda d: -d["score"]):
        if all((d["mask"] & e["mask"]).sum() < 0.5 * min(d["mask"].sum(), e["mask"].sum()) for e in distinct):
            distinct.append(d)
    if len(distinct) < 2 and faces < 2:
        return None
    out = people.keep_only(image, matte, keep, dets=dets)
    # A cutout far smaller than the matte's share of him means the separation went wrong.
    if out is None or (out > 128).sum() < 0.12 * solid.sum():
        return None
    ISOLATION["intruders"] = 0
    ISOLATION["separated"] = len(distinct) - 1
    return Image.fromarray(out)


def isolate_main_person(image: Image.Image, mask: Image.Image, face: list[float] | None = None, person: list[float] | None = None) -> Image.Image:
    """Photos with teammates, opponents or a mascot kid: keep only the player whose face is biggest.

    SAM, prompted with a body-sized box under that face, finds the one person (coarse edges); the
    fine matte from the main model is kept only inside it."""
    try:
        import cv2
    except ImportError:
        return mask
    # Only look for a face when the caller has not already said which body is his: the biggest face in
    # the picture often belongs to an opponent closer to the camera.
    person = [float(v) for v in person] if person is not None else None
    face = face or (None if person else find_face(image))
    if not face and person is None:
        return mask
    W, H = image.size
    if face:
        x, y, w, h = face[0] * W, face[1] * H, face[2] * W, face[3] * H
        cx, cy = x + w / 2, y + h / 2
        box = [int(max(0, cx - 4 * w)), int(max(0, y - 0.5 * h)), int(min(W - 1, cx + 4 * w)), H - 1]
    else:
        # No face of his (turned away, or an opponent's face is the only one): his body box will do.
        box = [int(max(0, person[0])), int(max(0, person[1])), int(min(W - 1, person[2])), int(min(H - 1, person[3]))]
        cx, cy = (box[0] + box[2]) / 2, box[1] + (box[3] - box[1]) * 0.35
    prompt = [{"type": "rectangle", "data": box, "label": 1}, {"type": "point", "data": [int(cx), int(cy)], "label": 1}]
    # With the pose model: his exact body box, his joints to keep, the other players' joints to cut away
    # (an opponent's leg in a tackle, a hand grabbing his shirt).
    try:
        guide = pose.people_points(image, face, person)
    except Exception as e:  # noqa: BLE001
        print(f"pose guide failed: {e}", file=sys.stderr)
        guide = None
    behind: list[list[int]] = []
    if guide:
        gbox, keep_pts, drop_pts = guide
        gbox = [float(v) for v in gbox]
        prompt = [{"type": "rectangle", "data": [int(v) for v in gbox], "label": 1}, {"type": "point", "data": [int(cx), int(cy)], "label": 1}]
        # A team-mate right behind him is often merged into his detection (one box for both, no joints of
        # the other to cut away): every OTHER face inside his box is someone else — its head and the torso
        # under it are marked "not him" (Massil Adjaoudi, 23/10: a team-mate's shirt and hand stayed in).
        behind = behind_points(image, face, gbox, keep_pts)
        drop_pts = list(drop_pts) + behind
        prompt += [{"type": "point", "data": p, "label": 1} for p in keep_pts]
        prompt += [{"type": "point", "data": p, "label": 0} for p in drop_pts]
    sam = np.array(remove(image, session=new_session("sam"), only_mask=True, sam_prompt=prompt)) > 128
    # Keep the blob that contains the face, grown a little so hair and fingertips from the fine matte survive.
    n, labels = cv2.connectedComponents(sam.astype(np.uint8))
    seed = labels[min(H - 1, int(cy)), min(W - 1, int(cx))]
    others = guide[2] if guide else []
    # SAM missed: better two people than half a player. With other players in the shot, though, a
    # small result is expected (the matte held all of them), so it is kept.
    grow = max(9, round(max(W, H) / 120)) | 1
    sam_missed = seed == 0 or (sam.sum() < 0.2 * (np.array(mask) > 128).sum() and not others)
    if sam_missed and not guide:
        return mask
    if sam_missed:
        out = mask  # the skeleton corridor below may still separate him; otherwise it is flagged
    else:
        keep = cv2.dilate((labels == seed).astype(np.uint8) * 255, np.ones((grow, grow), np.uint8))
        keep = cv2.GaussianBlur(keep, (grow, grow), 0)
        out = Image.fromarray((np.array(mask).astype(np.float32) * keep / 255).astype(np.uint8))
    # With other players around: whatever lies far from his skeleton (someone lying next to him, a
    # team-mate's back) is not him.
    if guide:
        corridor = pose.body_corridor(image.size)
        if corridor is not None:
            soft = cv2.GaussianBlur(corridor, (grow, grow), 0).astype(np.float32) / 255
            out = Image.fromarray((np.array(out).astype(np.float32) * soft).astype(np.uint8))
    # Other players' joints still inside the cutout: an arm or leg we could not separate.
    # A result far smaller than his own body box means the separation went wrong: keep the full matte.
    a = np.array(out)
    kept = (a > 128).sum()
    if person is not None:
        bw, bh = max(1.0, person[2] - person[0]), max(1.0, person[3] - person[1])
        if kept < 0.22 * bw * bh:
            return mask
    # He was alone in the matte (no other player detected): cutting a big part away can only be a mistake.
    alone = not pose.PEOPLE_CACHE.get("others") and count_people(mask) <= 1
    if alone and kept < 0.5 * (np.array(mask) > 128).sum():
        return mask
    ISOLATION["intruders"] = sum(1 for x, y in others if 0 <= y < a.shape[0] and 0 <= x < a.shape[1] and a[y, x] > 128)
    # ...or a good part of another player's body still in it.
    for b in pose.PEOPLE_CACHE.get("others", []):
        x0, y0, x1, y1 = [int(v) for v in b]
        region = a[max(0, y0) : max(0, y1), max(0, x0) : max(0, x1)]
        if region.size and (region > 128).mean() > 0.25:
            ISOLATION["intruders"] += 1
    return out


def add_ball(image: Image.Image, mask: Image.Image) -> Image.Image:
    """A ball at his feet always stays in the cutout (user, 22/10: "a bola fica sempre presente").

    Looks for a round ball-sized object (≈ 7–18% of his height across) around and below his feet,
    segments it with SAM from a box around it and adds it to the matte. Nothing found: matte unchanged."""
    try:
        import cv2
    except ImportError:
        return mask
    a = np.array(mask)
    ys, xs = np.where(a > 128)
    if len(ys) < 500:
        return mask
    W, H = image.size
    top, bottom, left, right = ys.min(), ys.max(), xs.min(), xs.max()
    bh, bw = bottom - top, right - left
    if bh < 150:
        return mask
    # Search window: lower part of his body and a bit past it, to both sides.
    x0, x1 = int(max(0, left - 0.6 * bw)), int(min(W, right + 0.6 * bw))
    y0, y1 = int(max(0, top + 0.55 * bh)), int(min(H, bottom + 0.3 * bh))
    if x1 - x0 < 40 or y1 - y0 < 40:
        return mask
    rgb = np.array(image)[y0:y1, x0:x1]
    gray = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), (5, 5), 0)
    rmin, rmax = max(6, int(0.035 * bh)), max(10, int(0.095 * bh))
    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT_ALT, dp=1.5, minDist=rmin * 2, param1=250, param2=0.72, minRadius=rmin, maxRadius=rmax)
    if circles is None:
        return mask
    # The object detector's footballs (people.ball_boxes): a round letter on an ad board is round and light
    # too ("u" of "tufai" kept as a ball, Moisés 28/10). Without the model every candidate is considered.
    try:
        balls = people.ball_boxes(image)
    except Exception as e:  # noqa: BLE001
        print(f"ball detector failed: {e}", file=sys.stderr)
        balls = None
    # Feet: the lowest rows of his matte.
    foot_y = bottom
    foot_x = xs[ys > bottom - 0.08 * bh].mean()
    best = None
    for cx, cy, r in circles[0]:
        gx, gy = cx + x0, cy + y0
        disc = np.zeros(gray.shape, np.uint8)
        cv2.circle(disc, (int(cx), int(cy)), int(r * 0.85), 1, -1)
        vals = rgb[disc > 0]
        if not len(vals):
            continue
        lum = vals.mean(axis=1)
        sat = vals.max(axis=1).astype(int) - vals.min(axis=1)
        # A football: mostly light, with a printed pattern (some contrast), not grass-green.
        green = (vals[:, 1].astype(int) - np.maximum(vals[:, 0], vals[:, 2])).mean()
        if lum.mean() < 110 or lum.std() < 18 or green > 25 or sat.mean() > 90:
            continue
        # Already part of him (a knee, a white sock): not a separate ball.
        if (a[int(gy), int(gx)] > 128) and (a[max(0, int(gy - r)) : int(gy + r), max(0, int(gx - r)) : int(gx + r)] > 128).mean() > 0.85:
            continue
        dist = np.hypot(gx - foot_x, (gy - foot_y) * 1.5) / bh
        if dist > 0.55:
            continue
        if balls is not None and not any(bx0 - r <= gx <= bx1 + r and by0 - r <= gy <= by1 + r for bx0, by0, bx1, by1 in balls):
            continue
        if best is None or dist < best[0]:
            best = (dist, gx, gy, r)
    if best is None:
        return mask
    _, gx, gy, r = best
    pad = r * 1.35
    box = [int(max(0, gx - pad)), int(max(0, gy - pad)), int(min(W - 1, gx + pad)), int(min(H - 1, gy + pad))]
    prompt = [{"type": "rectangle", "data": box, "label": 1}, {"type": "point", "data": [int(gx), int(gy)], "label": 1}]
    ball = None
    try:
        sam = np.array(remove(image, session=new_session("sam"), only_mask=True, sam_prompt=prompt)) > 128
        n, labels = cv2.connectedComponents(sam.astype(np.uint8))
        seed = labels[int(gy), int(gx)]
        if seed:
            comp = labels == seed
            area = comp.sum()
            # Roughly the circle found (not the whole pitch, not a speck).
            if 0.45 * np.pi * r * r < area < 1.8 * np.pi * r * r:
                ball = comp
    except Exception as e:  # noqa: BLE001
        print(f"ball sam failed: {e}", file=sys.stderr)
    if ball is None:
        ball = np.zeros((H, W), bool)
        cv2.circle(ball.view(np.uint8), (int(gx), int(gy)), int(r * 0.97), 1, -1)
        ball = ball.astype(bool)
    soft = cv2.GaussianBlur(ball.astype(np.uint8) * 255, (5, 5), 0)
    print(f"ball kept at {int(gx)},{int(gy)} r={int(r)}", file=sys.stderr)
    BALL["found"] = True
    return Image.fromarray(np.maximum(a, soft).astype(np.uint8))


BALL: dict = {"found": False}


ISOLATION: dict = {"intruders": 0}


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    model = sys.argv[3] if len(sys.argv) > 3 else "birefnet-portrait"

    # Phone photos carry their rotation in EXIF: apply it, or the player lies on his side.
    image = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    src_w, src_h = image.size
    # 1. Frame the player before upscaling, so far-away shots get all the new pixels on him.
    # Which of the people in the shot is our player: his face (from his other photos), else his kit.
    refs = [r for r in os.environ.get("PLAYER_REFS", "").split("|") if r]
    kit = [k for k in os.environ.get("PLAYER_KIT", "").split(",") if k]
    try:
        person, face_hint, chosen_by = pose.main_person(image, reference_faces(refs), kit)
    except Exception as e:  # noqa: BLE001
        print(f"person detection failed: {e}", file=sys.stderr)
        person, face_hint, chosen_by = None, None, "erro"
    # The face that belongs to that person (not an opponent's in the same shot).
    face0 = face_hint or find_face(image)
    if face0 and person:
        cx, cy = (face0[0] + face0[2] / 2) * image.width, (face0[1] + face0[3] / 2) * image.height
        if not (person[0] <= cx <= person[2] and person[1] <= cy <= person[3]):
            face0 = None

    full_w, full_h = image.size
    person_full = list(person) if person else None
    # Everyone else in the shot, on the whole original (the frame the NATURAL looks draw): the looks keep
    # their text off team-mates and opponents (others.py). A failure only leaves the field out.
    crowd = None
    try:
        crowd = others.find(image, person_full)
    except Exception as e:  # noqa: BLE001
        print(f"others failed: {e}", file=sys.stderr)
    image, crop_box = enhance.crop_to_player(image, person, face0)
    cropped = crop_box is not None
    # Face position in the cropped picture (it is 0..1 of the whole photo until now).
    if face0 and crop_box:
        cx0, cy0, cx1, cy1 = crop_box
        face0 = [(face0[0] * full_w - cx0) / (cx1 - cx0), (face0[1] * full_h - cy0) / (cy1 - cy0), face0[2] * full_w / (cx1 - cx0), face0[3] * full_h / (cy1 - cy0)]
    crop_h, crop_w = image.height, image.width
    # The chosen player's box, in the coordinates of the picture we are about to cut out.
    if person_full and crop_box:
        cx0, cy0, cx1, cy1 = crop_box
        person_full = [person_full[0] - cx0, person_full[1] - cy0, person_full[2] - cx0, person_full[3] - cy0]
    # 2. AI upscale (face never redrawn, see upscale()).
    image, upscaled = upscale(image)

    session = new_session(model)
    mask = remove(image, session=session, only_mask=True, post_process_mask=True)
    faces = count_faces(image)
    k = image.width / max(1, crop_w)
    # Other people in (or touching) the shot: keep only our player. First with one silhouette per person
    # (people.py: YOLO11-seg at three sizes + SAM from his box) — it separates a team-mate or an opponent
    # glued to him, which the matte draws as one blob and the blob count below cannot see (Moisés, 28/10).
    separated = None
    try:
        separated = separate_people(image, mask, face0, [float(v) * k for v in person_full] if person_full else None, faces)
    except Exception as e:  # noqa: BLE001
        print(f"people separation failed: {e}", file=sys.stderr)
    if separated is not None:
        # The ball at his feet was part of the shared blob: put it back from the matte before separation
        # (only round, ball-sized pieces outside everyone's silhouette, see people.keep_only).
        mask = separated
    elif faces > 1 or count_people(mask) > 1 or chosen_by != "maior":
        mask = isolate_main_person(image, mask, face0, [float(v) * k for v in person_full] if person_full else None)
    mask = drop_intruders(mask)
    # A ball at his feet stays in (after the clean-ups, which would drop it as a separate blob).
    try:
        mask = add_ball(image, mask)
    except Exception as e:  # noqa: BLE001
        print(f"ball check failed: {e}", file=sys.stderr)
    # Clean edges: pull the matte in by ~1px and soften it, which removes the light halo / fringe of the
    # old background that makes cutouts look "pasted".
    shrink = max(3, round(max(image.size) / 1200) * 2 + 1)
    mask = mask.filter(ImageFilter.MinFilter(shrink)).filter(ImageFilter.GaussianBlur(max(0.8, shrink / 3)))

    # 3. Colour and light treatment, measured on the player only (the matte), applied before cutting.
    graded = enhance.grade(image, np.asarray(mask).astype(np.float32) / 255)
    out = graded.copy()
    out.putalpha(mask)

    bbox = mask.point(lambda v: 255 if v > 12 else 0).getbbox()
    cuts = cut_edges(mask, bbox)
    if bbox:
        pad = 6
        left, top, right, bottom = bbox
        out = out.crop((max(0, left - pad), max(0, top - pad), min(out.width, right + pad), min(out.height, bottom + pad)))

    out.save(dst, "PNG", optimize=True)
    face = find_face(out)
    face_px = round(face[3] * out.height * crop_h / image.height) if face else 0
    try:
        body = pose.detect(out)
    except Exception as e:  # noqa: BLE001
        print(f"pose failed: {e}", file=sys.stderr)
        body = {"pose": "unknown", "facing": "front"}
    print(
        json.dumps(
            {
                "width": out.width,
                "height": out.height,
                "upscaled": upscaled,
                "face": face,
                "kit": kit_colors(out, face),
                "cut": cuts,
                "faces": faces,
                "people": count_people(out.getchannel("A")),
                # Size of the original photo (before AI upscaling): what the detail really is.
                "src_width": src_w,
                "src_height": src_h,
                # Face height in pixels of the original photo.
                "face_px": face_px,
                "cropped": cropped,
                "sharpness": round(sharpness(out, crop_h), 1),
                "chosen_by": chosen_by,
                # Joints of other players left in the cutout (an opponent's arm across him): needs a check.
                "intruders": ISOLATION["intruders"],
                "face_sharpness": round(fs, 1) if (fs := face_sharpness(out, face, face_px)) is not None else None,
                "enhanced": True,
                # Body pose (standing / action / celebrate / open / crouch / back / bust) and which way he looks.
                "pose": body.get("pose", "unknown"),
                "facing": body.get("facing", "front"),
                "back": body.get("back", False),
                "legs": body.get("legs", True),
                "ball": BALL["found"],
                # Other people's boxes, 0..1 of the original photo (x0, y0, x1, y1), and his own.
                **({"others": crowd["others"], "him_box": crowd["him"]} if crowd is not None else {}),
            }
        )
    )


if __name__ == "__main__":
    main()
    sys.stdout.flush()
    # onnxruntime can abort during interpreter teardown on macOS; the PNG is already written.
    os._exit(0)
