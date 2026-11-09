"""Keeps only the clicked player in a cutout (the "Separar jogador" step of the cutout touch-up).

Usage: separate.py <cutout.png> <points.json> <mask_out.png>
  points.json  {"keep": [[x, y], ...], "drop": [[x, y], ...]} in the cutout's pixels

When a team-mate or an opponent touches him, the cutout model draws them as one blob. The user clicks on him
(keep) and, if needed, on whoever does not belong (drop); people.keep_only finds every person (YOLO11-seg),
draws him whole with SAM from his box, and keeps the fine matte only there (see people.py).

Writes a white RGBA PNG whose alpha is the new matte, for the touch-up canvas to check and save.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

from people import keep_only


def main() -> None:
    src, pts_file, out = sys.argv[1], sys.argv[2], sys.argv[3]
    pts = json.load(open(pts_file))
    keep = [[int(x), int(y)] for x, y in pts.get("keep", [])]
    drop = [[int(x), int(y)] for x, y in pts.get("drop", [])]
    if not keep:
        raise SystemExit("no keep point")
    a = np.array(Image.open(src).convert("RGBA"))
    matte = keep_only(Image.fromarray(a[..., :3]), a[..., 3], keep, drop)
    if matte is None:
        raise SystemExit("could not tell who he is from the clicks")
    H, W = matte.shape
    Image.fromarray(np.dstack([np.full((H, W, 3), 255, np.uint8), matte]), "RGBA").save(out)
    print(f"kept {int((matte > 128).sum())} of {int((a[..., 3] > 128).sum())} px")


if __name__ == "__main__":
    main()
    sys.stdout.flush()
    # onnxruntime can abort during interpreter teardown on macOS; the PNG is already written.
    os._exit(0)
