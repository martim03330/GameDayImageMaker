"""Face matching for automatic photo discovery.

Usage: faces.py <candidate> <reference> [<reference> ...]

Prints JSON: {"width", "height", "faces": n, "best": cosine similarity of the best-matching face
to any reference face (-1 if none), "face": [x, y, w, h] of that face in 0..1}.
SFace's recommended same-person threshold for cosine similarity is 0.363.
"""

import json
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DET = cv2.FaceDetectorYN.create(os.path.join(HERE, "face_yunet.onnx"), "", (320, 320), 0.7)
REC = cv2.FaceRecognizerSF.create(os.path.join(HERE, "face_sface.onnx"), "")


def load(path: str) -> np.ndarray | None:
    data = np.fromfile(path, dtype=np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        return None
    scale = 1600 / max(img.shape[:2])
    if scale < 1:
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    return img


def faces(img: np.ndarray):
    h, w = img.shape[:2]
    DET.setInputSize((w, h))
    _, found = DET.detect(img)
    if found is None:
        return []
    out = []
    for f in found:
        feat = REC.feature(REC.alignCrop(img, f))
        out.append((f, feat))
    return out


def main() -> None:
    cand_path, refs = sys.argv[1], sys.argv[2:]
    ref_feats = []
    for r in refs:
        img = load(r)
        if img is None:
            continue
        found = faces(img)
        if found:
            # the largest face in a reference photo is the player
            ref_feats.append(max(found, key=lambda x: x[0][2] * x[0][3])[1])
    img = load(cand_path)
    if img is None:
        print(json.dumps({"error": "unreadable"}))
        return
    h, w = img.shape[:2]
    best, box = -1.0, None
    found = faces(img)
    for f, feat in found:
        for rf in ref_feats:
            s = float(REC.match(feat, rf, cv2.FaceRecognizerSF_FR_COSINE))
            if s > best:
                best, box = s, [float(f[0] / w), float(f[1] / h), float(f[2] / w), float(f[3] / h)]
    orig = cv2.imdecode(np.fromfile(cand_path, dtype=np.uint8), cv2.IMREAD_UNCHANGED)
    oh, ow = orig.shape[:2]
    # Faces at least 45% the size of the biggest one: a second big face means a group / handshake photo.
    big = 0
    if found:
        top = max(f[2] * f[3] for f, _ in found)
        big = sum(1 for f, _ in found if f[2] * f[3] >= 0.2 * top)
    print(json.dumps({"width": ow, "height": oh, "faces": big, "refs": len(ref_feats), "best": best, "face": box}))


if __name__ == "__main__":
    main()
