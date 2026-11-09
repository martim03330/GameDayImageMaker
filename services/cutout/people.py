"""One silhouette per person in a photo (YOLO11-seg, ONNX on CPU), and keeping only our player in a cutout.

Why: the cutout model (BiRefNet) draws everyone who touches him as one blob — a team-mate right behind, an
opponent in a duel. Counting blobs then says "one person" and nothing is separated (Moisés Conceição, 28/10).
An instance-segmentation model gives each person their own mask even when they overlap. Its masks are coarse
and can hand a stray limb to the wrong person (his boot drawn as the opponent's), so the final silhouette is
SAM's, prompted with HIS box and points on the others; the fine matte is kept only inside it.

    people_masks(image)                    -> [{"box", "score", "mask"}] per person
    people_multi(image)                    -> the same at three sizes (see why there)
    keep_only(image, matte, keep, drop)    -> the matte with only the person under the keep points

Model: models/yolo11l-seg.onnx (not in git, 111 MB). To recreate it, with the balltrack venv (it has
ultralytics; `pip install onnx` there first):
    cd services/cutout/models && ../../balltrack/.venv/bin/python -c \
      "from ultralytics import YOLO; YOLO('yolo11l-seg.pt').export(format='onnx', imgsz=1280)"
Without the file everything here returns "nobody found" and the cutout falls back to the older SAM-only path.
"""
from __future__ import annotations

import os

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(HERE, "models", "yolo11l-seg.onnx")
SIZE = 1280
_session = None


def _model():
    global _session
    if _session is None:
        import onnxruntime as ort

        _session = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
    return _session


def people_masks(image: Image.Image, conf: float = 0.3) -> list[dict]:
    """Every person YOLO11-seg finds: box (x0, y0, x1, y1 in image px), score, mask (bool, image size)."""
    if not os.path.exists(MODEL):
        return []
    rgb = np.asarray(image.convert("RGB"))
    H, W = rgb.shape[:2]
    # Letterbox to SIZE×SIZE (grey bars), as the model was trained.
    r = SIZE / max(W, H)
    nw, nh = round(W * r), round(H * r)
    px, py = (SIZE - nw) // 2, (SIZE - nh) // 2
    canvas = np.full((SIZE, SIZE, 3), 114, np.uint8)
    canvas[py : py + nh, px : px + nw] = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_AREA)
    blob = canvas.transpose(2, 0, 1)[None].astype(np.float32) / 255
    pred, protos = _model().run(None, {_model().get_inputs()[0].name: blob})
    pred = pred[0].T  # (anchors, 4 + 80 classes + 32 mask coefficients)
    scores = pred[:, 4]  # class 0: person
    sel = scores > conf
    if not sel.any():
        return []
    pred, scores = pred[sel], scores[sel]
    cx, cy, bw, bh = pred[:, 0], pred[:, 1], pred[:, 2], pred[:, 3]
    boxes = np.stack([cx - bw / 2, cy - bh / 2, bw, bh], 1)
    keep = cv2.dnn.NMSBoxes(boxes.tolist(), scores.tolist(), conf, 0.5)
    keep = np.array(keep).reshape(-1)
    proto = protos[0]  # (32, SIZE/4, SIZE/4)
    pc, ph, pw = proto.shape
    out = []
    for i in keep:
        coef = pred[i, 84:]
        m = 1 / (1 + np.exp(-(coef @ proto.reshape(pc, -1)))).reshape(ph, pw)
        m = cv2.resize(m, (SIZE, SIZE), interpolation=cv2.INTER_LINEAR)
        x0, y0, w0, h0 = boxes[i]
        crop = np.zeros_like(m)
        a0, b0 = max(0, int(x0)), max(0, int(y0))
        a1, b1 = min(SIZE, int(x0 + w0) + 1), min(SIZE, int(y0 + h0) + 1)
        crop[b0:b1, a0:a1] = m[b0:b1, a0:a1]
        crop = crop[py : py + nh, px : px + nw]
        mask = cv2.resize(crop, (W, H), interpolation=cv2.INTER_LINEAR) > 0.5
        if mask.sum() < 50:
            continue
        box = [(x0 - px) / r, (y0 - py) / r, (x0 + w0 - px) / r, (y0 + h0 - py) / r]
        out.append({"box": [float(max(0, box[0])), float(max(0, box[1])), float(min(W, box[2])), float(min(H, box[3]))], "score": float(scores[i]), "mask": _main_part(mask)})
    return out


def ball_boxes(image: Image.Image, conf: float = 0.15) -> list[list[float]] | None:
    """Boxes of sports balls (COCO class 32) the same model sees, or None without the model. Used to confirm
    the round shapes cutout.add_ball finds: a round letter on an ad board ("u" of "tufai") is not a ball."""
    if not os.path.exists(MODEL):
        return None
    rgb = np.asarray(image.convert("RGB"))
    H, W = rgb.shape[:2]
    r = SIZE / max(W, H)
    nw, nh = round(W * r), round(H * r)
    px, py = (SIZE - nw) // 2, (SIZE - nh) // 2
    canvas = np.full((SIZE, SIZE, 3), 114, np.uint8)
    canvas[py : py + nh, px : px + nw] = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_AREA)
    pred = _model().run(None, {_model().get_inputs()[0].name: canvas.transpose(2, 0, 1)[None].astype(np.float32) / 255})[0][0].T
    sel = pred[:, 4 + 32] > conf
    out = []
    for cx, cy, bw, bh in pred[sel, :4]:
        out.append([(cx - bw / 2 - px) / r, (cy - bh / 2 - py) / r, (cx + bw / 2 - px) / r, (cy + bh / 2 - py) / r])
    return out


def _main_part(mask: np.ndarray) -> np.ndarray:
    """A person's mask without the islands far from their body: YOLO often hands a neighbour's loose hand or
    foot to the nearest person (an opponent's raised hand inside Moisés's mask, 28/10)."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8))
    if n <= 2:
        return mask
    big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    main = labels == big
    # Islands touching (or almost) the main body stay: a hand split from the arm by a thin gap.
    reach = max(5, round(max(mask.shape) / 150)) | 1
    near = cv2.dilate(main.astype(np.uint8), np.ones((reach, reach), np.uint8)) > 0
    keep = main.copy()
    for i in range(1, n):
        if i != big and (labels == i)[near].any():
            keep |= labels == i
    return keep


def people_multi(image: Image.Image, scales: tuple[float, ...] = (1.0, 0.6, 0.4)) -> list[dict]:
    """people_masks at several sizes: the picture as it is, and shrunk onto a bigger grey canvas so each person
    looks as far away as in a match photo. In a close crop YOLO can merge two tangled bodies or split one in
    two; at 60 % it usually sees each player whole (Moisés + an opponent, 28/10). Masks come back in the
    picture's own pixels, each tagged with its scale."""
    W, H = image.size
    out = []
    for f in scales:
        if f >= 1:
            dets = people_masks(image)
            for d in dets:
                d["scale"] = 1.0
            out += dets
            continue
        side = int(max(W, H) / f)
        canvas = Image.new("RGB", (side, side), (114, 114, 114))
        ox, oy = (side - W) // 2, (side - H) // 2
        canvas.paste(image.convert("RGB"), (ox, oy))
        for d in people_masks(canvas):
            m = d["mask"][oy : oy + H, ox : ox + W]
            if m.sum() < 0.002 * W * H:
                continue
            x0, y0, x1, y1 = d["box"]
            out.append({"box": [max(0.0, x0 - ox), max(0.0, y0 - oy), min(float(W), x1 - ox), min(float(H), y1 - oy)], "score": d["score"], "mask": m, "scale": f})
    return out


def cut_unsure(dets: list[dict], me: dict | None) -> np.ndarray:
    """What only unsure detections (score < 0.8) cover — never a reason to drop the ball."""
    if not dets:
        return np.zeros((1, 1), bool)
    H, W = dets[0]["mask"].shape
    sure = np.zeros((H, W), bool)
    unsure = np.zeros((H, W), bool)
    for d in dets:
        if d is me:
            continue
        (sure if d["score"] >= 0.8 else unsure)[...] |= d["mask"]
    return unsure & ~sure


def _inner_point(mask: np.ndarray, avoid: np.ndarray | None = None) -> list[int]:
    """The point deepest inside a mask (and, when given, farthest from `avoid`)."""
    m = mask.astype(np.uint8)
    if avoid is not None:
        m = m & (~avoid).astype(np.uint8)
        if not m.any():
            m = mask.astype(np.uint8)
    d = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    y, x = np.unravel_index(int(np.argmax(d)), d.shape)
    return [int(x), int(y)]


def _spread_points(mask: np.ndarray, n: int, away: list[int], gap: float) -> list[list[int]]:
    """Up to n points well inside a mask, spread over it (a grid over its box), none closer than `gap` to
    `away` — to tell SAM "not this" all over his body when a red click lands next to him."""
    ys, xs = np.where(mask)
    if not len(xs):
        return []
    inside = cv2.distanceTransform(mask.astype(np.uint8), cv2.DIST_L2, 5)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cols, rows = 3, max(3, n // 3 + 1)
    pts = []
    for gy in np.linspace(y0, y1, rows + 2)[1:-1]:
        for gx in np.linspace(x0, x1, cols + 2)[1:-1]:
            x, y = int(gx), int(gy)
            win = inside[max(0, y - 40) : y + 40, max(0, x - 40) : x + 40]
            if not win.size or win.max() < 6:
                continue
            dy, dx = np.unravel_index(int(np.argmax(win)), win.shape)
            px, py = max(0, x - 40) + int(dx), max(0, y - 40) + int(dy)
            if np.hypot(px - away[0], py - away[1]) >= gap:
                pts.append([px, py])
    return pts[:n]


def _at(mask: np.ndarray, p: list[int]) -> bool:
    H, W = mask.shape
    return bool(mask[min(H - 1, max(0, p[1])), min(W - 1, max(0, p[0]))])


def keep_only(image: Image.Image, matte: np.ndarray, keep: list[list[int]], drop: list[list[int]] | None = None, dets: list[dict] | None = None) -> np.ndarray | None:
    """The matte (uint8, image size) with only the person under the `keep` points; `drop` points are on others
    (optional: every other person found is "other" anyway). None when it cannot tell who he is.

    1. Others = the people YOLO is sure of (score >= 0.6) that are not him. Unsure detections are ignored: in
       a close crop YOLO can make one "person" out of his legs tangled with an opponent's (Moisés, 28/10).
    2. SAM draws him whole from a box over everything left of the matte around his clicks (so his legs, boots
       and ball are in), his clicks, and points on the others as "not him".
    3. A red click (an opponent's leg tangled with his) takes away what SAM finds there; that always beats
       steps 1-2. The others' YOLO masks are taken away where SAM says not him.
    """
    from rembg import new_session, remove

    H, W = matte.shape
    session = new_session("sam")
    rgb = image.convert("RGB")
    dets = people_multi(image) if dets is None else dets
    sure = [d for d in dets if d["score"] >= 0.6]
    # Him: of the confident detections under his clicks, the most complete one (biggest) among those nearly as
    # confident as the best — a low-score giant is usually two people merged.
    his = [d for d in sure if any(_at(d["mask"], p) for p in keep)]
    if his:
        top = max(d["score"] for d in his)
        me = max((d for d in his if d["score"] >= 0.85 * top), key=lambda d: d["mask"].sum())
    else:
        me = None
    # Everyone else found with confidence, at any size (the same person seen at two sizes counts once).
    others = [d for d in sure if d is not me and not (me is not None and (d["mask"] & me["mask"]).sum() > 0.5 * d["mask"].sum())]
    drop = list(drop or [])
    # Every red click is cut for certain (step 3) — even inside what YOLO drew as him: it attaches a tangled
    # opponent's leg or hand to the nearest body.
    loose = drop
    not_them = [_inner_point(d["mask"], me["mask"] if me is not None else None) for d in others]

    # His box: the part of the matte (minus the others) connected to his clicks.
    theirs = np.zeros((H, W), bool)
    for d in others:
        theirs |= d["mask"]
    left = ((matte > 128) & ~theirs).astype(np.uint8)
    n, labels = cv2.connectedComponents(left)
    ids = {labels[min(H - 1, y), min(W - 1, x)] for x, y in keep} - {0}
    area = np.isin(labels, list(ids)) if ids else np.zeros((H, W), bool)
    if me is not None:
        area |= me["mask"]
    if not area.any():
        return None
    ys, xs = np.where(area)
    box = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    anchor = keep + ([_inner_point(me["mask"])] if me is not None else [])
    prompt = [{"type": "rectangle", "data": box, "label": 1}] + [{"type": "point", "data": p, "label": 1} for p in anchor]
    prompt += [{"type": "point", "data": p, "label": 0} for p in not_them + drop]
    sam = np.array(remove(rgb, session=session, only_mask=True, sam_prompt=prompt)) > 128
    n, labels = cv2.connectedComponents(sam.astype(np.uint8))
    seeds = {labels[min(H - 1, p[1]), min(W - 1, p[0])] for p in anchor} - {0}
    him = np.isin(labels, list(seeds)) if seeds else np.zeros((H, W), bool)
    if me is not None:
        him |= me["mask"]

    # Red clicks: SAM's blob there (with him as "not this") is cut, whatever steps 1-2 said.
    grow = max(9, round(max(W, H) / 120)) | 1
    forced = np.zeros((H, W), bool)
    for p in loose:
        guard = anchor + (_spread_points(me["mask"], 12, p, grow * 4) if me is not None else [])
        m = np.array(remove(rgb, session=session, only_mask=True, sam_prompt=[{"type": "point", "data": p, "label": 1}] + [{"type": "point", "data": q, "label": 0} for q in guard])) > 128
        n, lab = cv2.connectedComponents(m.astype(np.uint8))
        seed = lab[min(H - 1, p[1]), min(W - 1, p[0])]
        blob = lab == seed if seed else np.zeros((H, W), bool)
        dot = np.zeros((H, W), np.uint8)
        cv2.circle(dot, (p[0], p[1]), grow, 1, -1)
        # Inside what YOLO drew as him, only near the click: skin touching skin (his thigh against an
        # opponent's) is one blob to SAM, and cutting him is worse than leaving a bit for the eraser.
        if me is not None:
            near = np.zeros((H, W), np.uint8)
            cv2.circle(near, (p[0], p[1]), grow * 4, 1, -1)
            blob &= ~me["mask"] | (near > 0)
        forced |= blob | (dot > 0)
    him &= ~forced
    if not him.any():
        return None

    # YOLO's silhouette of him is the backbone; SAM only adds what lies close to it (a boot, hair tips) — never a
    # whole team-mate in the same kit.
    if me is not None:
        reach = max(15, round(max(W, H) / 25)) | 1
        close = cv2.dilate(me["mask"].astype(np.uint8), np.ones((reach, reach), np.uint8)) > 0
        him = (me["mask"] | (him & close)) & ~forced
    near_him = cv2.dilate(him.astype(np.uint8), np.ones((grow, grow), np.uint8)) > 0
    keep_core = me["mask"] if me is not None else him
    cut = (theirs & ~keep_core) | forced
    region = near_him & ~cut
    soft = cv2.GaussianBlur(region.astype(np.float32), (grow, grow), 0)
    out = (matte.astype(np.float32) * soft).clip(0, 255).astype(np.uint8)
    # Only what touches him: loose bits of the others go — except the ball (a round blob nobody's body
    # covers), which the cutout keeps on purpose (cutout.add_ball).
    solid = (matte > 64).astype(np.uint8)
    n, labels = cv2.connectedComponents(solid)
    out_solid = out > 64
    ids = {int(v) for v in np.unique(labels[him & out_solid])} - {0}
    if not ids:
        return None
    # Of the pieces touching him keep the real ones: a piece of matte that lies mostly outside his silhouette
    # (an opponent's arm reaching past him, a hand on his back) is someone else.
    body = cv2.dilate(him.astype(np.uint8), np.ones((grow, grow), np.uint8)) > 0
    for i in list(ids):
        piece = labels == i
        if (piece & body).sum() < 0.5 * piece.sum():
            ids.discard(i)
    final = np.isin(labels, list(ids))
    # Bits of matte outside his silhouette that hang on to him (an arm thrown across, a sliver of shirt):
    # they survive the blob test, so the silhouette — grown by a margin for hair and boots — cuts them.
    reach = max(15, round(max(W, H) / 40)) | 1
    margin = cv2.dilate(him.astype(np.uint8), np.ones((reach, reach), np.uint8)) > 0
    final &= margin
    result = (out.astype(np.float32) * cv2.GaussianBlur(final.astype(np.float32), (5, 5), 0)).clip(0, 255).astype(np.uint8)
    # What of the matte lies outside every body (his and the others'): round blobs there are the ball. Only
    # the bodies of people YOLO is sure of count — an unsure "person" often covers the ball at his feet.
    people = cv2.dilate(((theirs & ~cut_unsure(dets, me)) | him).astype(np.uint8), np.ones((grow, grow), np.uint8)) > 0
    rest = (solid > 0) & ~people
    n, labels = cv2.connectedComponents(rest.astype(np.uint8))
    for i in range(1, n):
        blob = labels == i
        area = int(blob.sum())
        if area < 0.002 * W * H:
            continue
        cs, _ = cv2.findContours(blob.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        per = sum(cv2.arcLength(c, True) for c in cs)
        if per and 4 * np.pi * area / per**2 > 0.6:
            ball = cv2.dilate(blob.astype(np.uint8), np.ones((grow, grow), np.uint8)) > 0
            result[ball] = np.maximum(result[ball], matte[ball])
    # And every football the detector sees near his feet: the matte inside its circle comes back.
    ys, xs = np.where(him)
    if len(ys):
        foot, height = ys.max(), ys.max() - ys.min()
        for bx0, by0, bx1, by1 in ball_boxes(image) or []:
            cx, cy, rad = (bx0 + bx1) / 2, (by0 + by1) / 2, max(bx1 - bx0, by1 - by0) / 2
            if rad <= 0 or rad > 0.2 * height or cy < foot - 0.5 * height or cy > foot + 0.35 * height:
                continue
            disc = np.zeros((H, W), np.uint8)
            cv2.circle(disc, (int(cx), int(cy)), int(rad * 1.08), 1, -1)
            disc = disc > 0
            result[disc] = np.maximum(result[disc], matte[disc])
    return result
