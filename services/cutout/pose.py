"""Body pose of a player, so each photo goes to the looks that suit it (RTMPose, CPU, via rtmlib).

Usage: python pose.py <image> [...]   → one JSON line per file.
Also imported by cutout.py: `detect()` for the pose label, `main_person()` for where the player is.
"""

import json
import os
import sys

import numpy as np
from PIL import Image

_body = None

# COCO keypoints.
NOSE, L_EYE, R_EYE = 0, 1, 2
L_SH, R_SH, L_EL, R_EL, L_WR, R_WR = 5, 6, 7, 8, 9, 10
L_HIP, R_HIP, L_KN, R_KN, L_AN, R_AN = 11, 12, 13, 14, 15, 16
SEEN = 0.45  # keypoint score above which a joint counts as visible


def _get():
    global _body
    if _body is None:
        from rtmlib import Body

        # Models are downloaded once to ~/.cache/rtmlib.
        _body = Body(mode="performance", backend="onnxruntime", device="cpu")
    return _body


def _rgb(image: Image.Image) -> Image.Image:
    """RGBA cutouts go on flat mid-grey: the models were trained on real photos, not transparency."""
    if image.mode == "RGBA":
        bg = Image.new("RGBA", image.size, (128, 128, 128, 255))
        bg.alpha_composite(image)
        return bg.convert("RGB")
    return image.convert("RGB")


def _run(image: Image.Image):
    img = _rgb(image)
    scale = min(1.0, 1600 / max(img.size))
    if scale < 1:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    bgr = np.asarray(img)[:, :, ::-1].copy()
    body = _get()
    boxes = body.det_model(bgr)
    if boxes is None or len(boxes) == 0:
        return None, None, scale
    kpts, scores = body.pose_model(bgr, bboxes=boxes)
    return np.asarray(boxes), (np.asarray(kpts), np.asarray(scores)), scale


def main_person(image: Image.Image, ref_faces: list | None = None, kit: list[str] | None = None) -> tuple[list[float] | None, list[float] | None, str]:
    """Which person the photo is about, in a shot with team-mates and opponents.

    1. the face that matches the player's known face (SFace, `ref_faces` = features from his photos);
    2. else the shirt closest to the club colours (`kit` = ["#rrggbb", ...]);
    3. else the biggest person.
    Returns (person box [x0, y0, x1, y1] px, face box [x, y, w, h] 0..1 or None, how it was chosen)."""
    boxes, pose, scale = _run(image)
    if boxes is None:
        return None, None, "none"
    W, H = image.size
    px = lambda b: [float(b[0] / scale), float(b[1] / scale), float(b[2] / scale), float(b[3] / scale)]  # noqa: E731
    area = lambda b: (b[2] - b[0]) * (b[3] - b[1])  # noqa: E731
    big = max(area(b) for b in boxes)
    # Only people big enough to be the subject (not the crowd).
    people = [i for i, b in enumerate(boxes) if area(b) > 0.12 * big]

    if ref_faces:
        import faces as facelib  # noqa: PLC0415

        bgr = np.asarray(_rgb(image))[:, :, ::-1].copy()
        scored = []
        for f, feat in facelib.faces(bgr):
            sim = max(float(facelib.REC.match(feat, r, facelib.cv2.FaceRecognizerSF_FR_COSINE)) for r in ref_faces)
            scored.append((sim, f))
        scored.sort(key=lambda x: -x[0])
        # SFace calls 0.363 the same person, but in a match photo several players look alike: ask for a
        # clear match, and for it to beat the next face by a margin. Otherwise the kit decides.
        best, best_face = (scored[0] if scored else (0, None))
        runner = scored[1][0] if len(scored) > 1 else 0
        if best_face is not None and (best < 0.45 or best - runner < 0.08):
            best_face = None
        if best_face is not None:
            cx, cy = best_face[0] + best_face[2] / 2, best_face[1] + best_face[3] / 2
            owner = [i for i in people if boxes[i][0] / scale <= cx <= boxes[i][2] / scale and boxes[i][1] / scale <= cy <= boxes[i][3] / scale]
            if owner:
                i = min(owner, key=lambda i: area(boxes[i]))
                fb = [float(best_face[0] / W), float(best_face[1] / H), float(best_face[2] / W), float(best_face[3] / H)]
                return px(boxes[i]), fb, f"cara {best:.2f}"

    if kit and pose is not None:
        kpts, scores = pose
        rgb = np.asarray(_rgb(image).resize((round(W * scale), round(H * scale)))).astype(np.float32)
        targets = [np.array([int(c[i : i + 2], 16) for i in (1, 3, 5)], np.float32) for c in kit]

        def shirt_distance(i: int) -> float:
            k = kpts[i]
            xs = [k[L_SH][0], k[R_SH][0], k[L_HIP][0], k[R_HIP][0]]
            ys = [k[L_SH][1], k[R_SH][1], k[L_HIP][1], k[R_HIP][1]]
            x0, x1 = int(max(0, min(xs))), int(min(rgb.shape[1], max(xs)))
            y0, y1 = int(max(0, min(ys))), int(min(rgb.shape[0], max(ys)))
            patch = rgb[y0:y1, x0:x1].reshape(-1, 3)
            if len(patch) < 20:
                return 1e9
            # Share of shirt pixels close to one of the club colours (striped kits have two).
            near = np.zeros(len(patch), bool)
            for t in targets:
                near |= np.linalg.norm(patch - t, axis=1) < 70
            return -float(near.mean())

        scored = sorted(people, key=shirt_distance)
        if scored and shirt_distance(scored[0]) < -0.25:
            return px(boxes[scored[0]]), None, "equipamento"

    i = max(people, key=lambda i: area(boxes[i]))
    return px(boxes[i]), None, "maior"


def people_points(image: Image.Image, face: list[float] | None, person: list[float] | None = None) -> tuple[list[float], list[list[int]], list[list[int]]] | None:
    """For separating our player from the others touching him: his box, his visible joints (keep) and
    the other people's joints that fall inside his box (remove). `face` = [x, y, w, h] in 0..1."""
    boxes, pose, scale = _run(image)
    if boxes is None or pose is None:
        return None
    kpts, scores = pose
    W, H = image.size
    area = lambda b: (b[2] - b[0]) * (b[3] - b[1])  # noqa: E731
    if face:
        cx, cy = (face[0] + face[2] / 2) * W * scale, (face[1] + face[3] / 2) * H * scale
        inside = [i for i, b in enumerate(boxes) if b[0] <= cx <= b[2] and b[1] <= cy <= b[3]]
        me = min(inside, key=lambda i: area(boxes[i])) if inside else int(np.argmax([area(b) for b in boxes]))
    elif person:
        # The box the app already decided is our player (by kit): the detection that overlaps it most.
        p = [v * scale for v in person]
        overlap = lambda b: max(0, min(b[2], p[2]) - max(b[0], p[0])) * max(0, min(b[3], p[3]) - max(b[1], p[1]))  # noqa: E731
        me = int(np.argmax([overlap(b) for b in boxes]))
    else:
        me = int(np.argmax([area(b) for b in boxes]))
    b = boxes[me]
    pad = 0.06 * max(b[2] - b[0], b[3] - b[1])
    x0, y0, x1, y1 = b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad
    joints = (L_SH, R_SH, L_EL, R_EL, L_WR, R_WR, L_HIP, R_HIP, L_KN, R_KN, L_AN, R_AN, NOSE)
    to_px = lambda p: [int(p[0] / scale), int(p[1] / scale)]  # noqa: E731
    keep = [to_px(kpts[me][j]) for j in joints if scores[me][j] > 0.5]
    drop = []
    for i in range(len(boxes)):
        if i == me:
            continue
        for j in joints:
            x, y = kpts[i][j]
            if scores[i][j] > 0.5 and x0 <= x <= x1 and y0 <= y <= y1:
                # Skip joints sitting right on one of ours (overlapping limbs): SAM would get two answers.
                if all(abs(x - kpts[me][k][0]) + abs(y - kpts[me][k][1]) > 0.04 * (b[3] - b[1]) for k in joints):
                    drop.append(to_px((x, y)))
    box = [float(max(0, x0) / scale), float(max(0, y0) / scale), float(min(W * scale, x1) / scale), float(min(H * scale, y1) / scale)]
    PEOPLE_CACHE["me"] = (np.asarray(kpts[me]) / scale, np.asarray(scores[me]))
    PEOPLE_CACHE["others"] = [np.asarray(boxes[i][:4]) / scale for i in range(len(boxes)) if i != me]
    return box, keep, drop[:16]


# Our player's joints from the last people_points() call (px, scores), for body_corridor().
PEOPLE_CACHE: dict = {}


def body_corridor(size: tuple[int, int]) -> np.ndarray | None:
    """Mask of the area around our player's skeleton (limbs drawn as thick bands, torso filled, head
    disc, a margin for kit and ball). Anything outside it belongs to someone else."""
    if "me" not in PEOPLE_CACHE:
        return None
    k, s = PEOPLE_CACHE["me"]
    # Only when his whole body is clearly found: a corridor around half a skeleton would cut him in two.
    if not all(s[i] > 0.4 for i in (L_SH, R_SH, L_HIP, R_HIP, L_KN, R_KN, L_AN, R_AN)):
        return None
    return skeleton_mask(k, s, size)


def skeleton_mask(k: np.ndarray, s: np.ndarray, size: tuple[int, int], margin: float = 0.15) -> np.ndarray | None:
    """The body area around one skeleton (px joints, scores): limbs as thick bands, torso, head, hands, feet."""
    import cv2

    W, H = size
    seen = lambda i: s[i] > 0.4  # noqa: E731
    sh_w = abs(k[L_SH][0] - k[R_SH][0])
    torso = abs((k[L_HIP][1] + k[R_HIP][1]) / 2 - (k[L_SH][1] + k[R_SH][1]) / 2) if seen(L_HIP) or seen(R_HIP) else sh_w * 1.6
    unit = max(torso, sh_w, 20)
    m = np.zeros((H, W), np.uint8)
    limb = int(unit * 0.55)
    pt = lambda i: (int(k[i][0]), int(k[i][1]))  # noqa: E731
    for a, b in ((L_SH, L_EL), (L_EL, L_WR), (R_SH, R_EL), (R_EL, R_WR), (L_HIP, L_KN), (L_KN, L_AN), (R_HIP, R_KN), (R_KN, R_AN), (L_SH, R_SH), (L_HIP, R_HIP)):
        if seen(a) and seen(b):
            cv2.line(m, pt(a), pt(b), 255, limb)
    body = [pt(i) for i in (L_SH, R_SH, R_HIP, L_HIP) if seen(i)]
    if len(body) >= 3:
        cv2.fillPoly(m, [np.array(body, np.int32)], 255)
    if seen(NOSE):
        cv2.circle(m, pt(NOSE), int(unit * 0.75), 255, -1)
    # Hands and feet reach past the wrist / ankle joint; the ball sits at the foot.
    for i in (L_WR, R_WR):
        if seen(i):
            cv2.circle(m, pt(i), int(unit * 0.4), 255, -1)
    for i in (L_AN, R_AN):
        if seen(i):
            cv2.circle(m, pt(i), int(unit * 0.4), 255, -1)
    if not m.any():
        return None
    return cv2.dilate(m, np.ones((int(unit * margin) | 1, int(unit * margin) | 1), np.uint8))


def classify(k: np.ndarray, s: np.ndarray, height: float, has_face: bool = True) -> dict:
    vis = lambda i: s[i] > SEEN  # noqa: E731
    x = lambda i: float(k[i][0])  # noqa: E731
    y = lambda i: float(k[i][1])  # noqa: E731

    sh_w = abs(x(L_SH) - x(R_SH)) or 1.0
    sh_y = (y(L_SH) + y(R_SH)) / 2
    sh_x = (x(L_SH) + x(R_SH)) / 2
    hips = vis(L_HIP) or vis(R_HIP)
    hip_y = (y(L_HIP) + y(R_HIP)) / 2
    # Torso length is steadier than shoulder width (which collapses when the player is side-on).
    torso = abs(hip_y - sh_y) if hips else sh_w * 1.6
    unit = max(torso, sh_w, 1.0)

    # Knees only count inside the picture: on busts the model guesses joints below the frame.
    in_frame = lambda i: vis(i) and y(i) < height * 0.97  # noqa: E731
    # ...and must sit clearly below the hips (the model sometimes puts them at shoulder height).
    below_hips = lambda i: hips and y(i) > hip_y + torso * 0.3  # noqa: E731
    legs = any(in_frame(i) and below_hips(i) for i in (L_KN, R_KN))
    # Facing the camera the player's left shoulder is on the image's right. The model still "sees" eyes
    # on the back of a head, so swapped shoulders only mean "back turned" when no real face is found.
    back = x(L_SH) < x(R_SH) - sh_w * 0.1 and not has_face

    wrists = [i for i in (L_WR, R_WR) if vis(i)]
    arms_up = [i for i in wrists if y(i) < sh_y - unit * 0.3]
    spread = abs(x(L_WR) - x(R_WR)) / unit if len(wrists) == 2 else 0
    arms_open = len(wrists) == 2 and spread > 1.8 and all(abs(y(i) - sh_y) < unit * 0.6 for i in wrists)

    stride = abs(x(L_AN) - x(R_AN)) / unit if vis(L_AN) and vis(R_AN) else 0
    # One foot well off the ground: kicking, running.
    foot_lift = abs(y(L_AN) - y(R_AN)) / unit if in_frame(L_AN) and in_frame(R_AN) else 0
    knee_lift = abs(y(L_KN) - y(R_KN)) / unit if vis(L_KN) and vis(R_KN) else 0
    knee_y = (y(L_KN) + y(R_KN)) / 2
    crouch = legs and hips and (knee_y - hip_y) < unit * 0.45
    lean = abs(sh_x - (x(L_HIP) + x(R_HIP)) / 2) / unit if hips else 0

    if back:
        pose = "back"
    elif not legs:
        pose = "bust"
    elif arms_up:
        pose = "celebrate"
    elif arms_open:
        pose = "open"
    elif crouch:
        pose = "crouch"
    elif stride > 0.7 or knee_lift > 0.3 or foot_lift > 0.25 or lean > 0.3:
        pose = "action"
    else:
        pose = "standing"

    # Which way the head points: nose against the middle of the shoulders, in shoulder widths.
    turn = (x(NOSE) - sh_x) / max(sh_w, 1.0) if vis(NOSE) else 0
    facing = "right" if turn > 0.2 else "left" if turn < -0.2 else "front"
    return {"pose": pose, "facing": facing, "back": bool(back), "legs": bool(legs), "arms_up": len(arms_up), "stride": round(stride, 2), "lean": round(lean, 2)}


def detect(image: Image.Image) -> dict:
    """Pose label + which way the player faces, for the biggest person in the image."""
    boxes, pose, _ = _run(image)
    if boxes is None or pose is None:
        return {"pose": "unknown", "facing": "front"}
    kpts, scores = pose
    areas = [(b[2] - b[0]) * (b[3] - b[1]) for b in boxes]
    i = int(np.argmax(areas))
    return classify(kpts[i], scores[i], image.height * min(1.0, 1600 / max(image.size)), _has_face(image))


def _has_face(image: Image.Image) -> bool:
    """A real, frontal-ish face (YuNet, same detector as the cutout step)."""
    import cv2

    img = _rgb(image)
    scale = 1200 / max(img.size)
    small = img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))))
    det = cv2.FaceDetectorYN.create(os.path.join(os.path.dirname(__file__), "face_yunet.onnx"), "", small.size, 0.6)
    _, faces = det.detect(np.asarray(small)[:, :, ::-1].copy())
    return faces is not None and len(faces) > 0


if __name__ == "__main__":
    for path in sys.argv[1:]:
        try:
            print(json.dumps({"file": path, **detect(Image.open(path))}))
        except Exception as e:  # noqa: BLE001
            print(json.dumps({"file": path, "pose": "unknown", "facing": "front", "error": str(e)}))
        sys.stdout.flush()
    os._exit(0)
