"""Where the OTHER people are in a photo (team-mates, opponents, the referee), so the looks keep their text off them.

One YOLO11-seg pass (people.people_masks) on the whole original, EXIF-rotated as the looks draw it. Which of the
people is our player:
  - while cutting out (cutout.py), the person the pipeline already chose (pose.main_person: his face, else his kit,
    else the biggest one) — the detection whose box overlaps that person's box most;
  - for photos cut out before this existed (backfill), the detection whose silhouette covers the existing cutout's
    matte most, once that matte is put back where it sits in the original (meta.nat_align: x, y, k).
Boxes come back normalised to the original (0..1, x0 y0 x1 y1), the frame the NATURAL looks map onto the canvas
(templates/natgeom.ts). Without the model, or with nobody found, the answer is empty and the looks behave as before.

    python others.py <original> [<cutout.png> <x> <y> <k>]   -> {"him": box|null, "others": [box, ...]}
"""
from __future__ import annotations

import json
import sys

import numpy as np
from PIL import Image, ImageOps

import people

# People smaller than this share of the biggest one are the crowd in the stands: the look's shade handles them.
MIN_AREA = 0.04


def _norm(b: list[float], W: int, H: int) -> list[float]:
    return [round(max(0.0, b[0] / W), 4), round(max(0.0, b[1] / H), 4), round(min(1.0, b[2] / W), 4), round(min(1.0, b[3] / H), 4)]


def _iou(a: list[float], b: list[float]) -> float:
    ix = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union if union > 0 else 0.0


def find(image: Image.Image, person: list[float] | None = None, matte: np.ndarray | None = None) -> dict:
    """{"him": box or None, "others": [box, ...]} normalised to `image`. `person` (px box) or `matte` (bool, image
    size, where our player is) say which detection is him; with neither, nobody is "him" and all are others."""
    W, H = image.size
    dets = people.people_masks(image)
    if not dets:
        return {"him": None, "others": []}
    area = lambda b: (b[2] - b[0]) * (b[3] - b[1])  # noqa: E731
    big = max(area(d["box"]) for d in dets)
    dets = [d for d in dets if area(d["box"]) >= MIN_AREA * big]
    him = None
    if matte is not None and matte.any():
        # Share of each person's silhouette that lies inside his matte: him = the one mostly inside.
        cover = [float((d["mask"] & matte).sum()) / max(1.0, float(d["mask"].sum())) for d in dets]
        i = int(np.argmax(cover))
        if cover[i] > 0.4:
            him = i
    elif person:
        ious = [_iou(d["box"], person) for d in dets]
        i = int(np.argmax(ious))
        if ious[i] > 0.3:
            him = i
    return {
        "him": _norm(dets[him]["box"], W, H) if him is not None else None,
        "others": [_norm(d["box"], W, H) for j, d in enumerate(dets) if j != him],
    }


def matte_in_original(cutout: Image.Image, W: int, H: int, x: float, y: float, k: float) -> np.ndarray:
    """The cutout's alpha put back over the original (nat_align: top-left x, y in original px, k = cutout px per
    original px), as a bool mask the original's size."""
    a = cutout.getchannel("A")
    w, h = max(1, round(a.width / k)), max(1, round(a.height / k))
    small = np.asarray(a.resize((w, h), Image.BILINEAR)) > 128
    out = np.zeros((H, W), bool)
    x0, y0 = round(x), round(y)
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(W, x0 + w), min(H, y0 + h)
    if dx1 > dx0 and dy1 > dy0:
        out[dy0:dy1, dx0:dx1] = small[sy0 : sy0 + (dy1 - dy0), sx0 : sx0 + (dx1 - dx0)]
    return out


def main() -> None:
    image = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert("RGB")
    matte = None
    if len(sys.argv) >= 6:
        cut = Image.open(sys.argv[2]).convert("RGBA")
        matte = matte_in_original(cut, image.width, image.height, float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]))
    print(json.dumps(find(image, matte=matte)))


if __name__ == "__main__":
    main()
    sys.stdout.flush()
