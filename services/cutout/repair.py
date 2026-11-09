"""Repairs the holes in a cutout's matte (the "Reparar com IA" button of the cutout touch-up).

Usage: repair.py <cutout.png> <mask_out.png>

BiRefNet (the main cutout model) draws very fine edges, but it can drop whole patches of the body when they
look like the background — blue kit stripes against a bluish stand (Moisés Conceição, 28/10). SAM thinks in
whole objects: prompted with his body box and points on him, it returns a solid silhouette with coarse
edges. The two are merged: SAM's silhouette, pulled a few px in from its edge, fills the interior, and the
original matte keeps the edges and the hair. SAM may only add pixels close to the body already cut out, so a
team-mate inside the same box is never brought in.

Writes a white RGBA PNG whose alpha is the repaired matte (what the touch-up canvas loads as its mask).
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    a = np.array(Image.open(src).convert("RGBA"))
    al = a[..., 3]
    H, W = al.shape
    body = al > 128
    if not body.any():
        raise SystemExit("empty matte")
    ys, xs = np.where(body)
    box = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    # Positive points: a grid over the box, kept only where the matte is solidly him.
    pts = []
    r = max(8, round(max(W, H) / 120))
    for gy in np.linspace(box[1], box[3], 10)[1:-1]:
        for gx in np.linspace(box[0], box[2], 8)[1:-1]:
            x, y = int(gx), int(gy)
            win = al[max(0, y - r) : y + r, max(0, x - r) : x + r]
            if win.size and win.min() > 250:
                pts.append([x, y])
    prompt = [{"type": "rectangle", "data": box, "label": 1}] + [{"type": "point", "data": p, "label": 1} for p in pts[:24]]
    sam = np.array(remove(Image.fromarray(a[..., :3]), session=new_session("sam"), only_mask=True, sam_prompt=prompt)) > 128

    # The SAM blob that is him: the one overlapping the existing matte most (stray specks dropped).
    n, labels = cv2.connectedComponents(sam.astype(np.uint8))
    if n <= 1:
        raise SystemExit("sam found nothing")
    overlap = [(body & (labels == i)).sum() for i in range(1, n)]
    him = (labels == 1 + int(np.argmax(overlap))).astype(np.uint8)

    # Interior only (coarse SAM edges stay out), and only near the body already cut out.
    pull = max(5, round(max(W, H) / 400)) | 1
    inner = cv2.erode(him, np.ones((pull, pull), np.uint8))
    reach = max(W, H) / 20
    dist = cv2.distanceTransform((~body).astype(np.uint8), cv2.DIST_L2, 5)
    inner[dist > reach] = 0
    soft = cv2.GaussianBlur(inner.astype(np.float32) * 255, (pull, pull), 0)
    matte = np.maximum(al.astype(np.float32), soft).clip(0, 255).astype(np.uint8)

    rgba = np.dstack([np.full((H, W, 3), 255, np.uint8), matte])
    Image.fromarray(rgba, "RGBA").save(out)
    print(f"added {int(((matte > 128) & ~body).sum())} px")


if __name__ == "__main__":
    main()
    sys.stdout.flush()
    # onnxruntime can abort during interpreter teardown on macOS; the PNG is already written.
    os._exit(0)
