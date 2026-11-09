"""Photo treatment before the cutout: frame the player, then a gentle, professional-looking grade.

Nothing here redraws the face: framing is a crop, the grade works on tones and colours, sharpening
only boosts detail that is already there.
"""

import numpy as np
from PIL import Image, ImageFilter

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None


def crop_to_player(image: Image.Image, box: list[float] | None, face: list[float] | None = None) -> tuple[Image.Image, tuple[int, int, int, int] | None]:
    """Crop around the main player (with room for the arms, hair and feet), so the upscale spends its
    pixels on him instead of grass and stands. Photos where he already fills the frame are left alone.

    `face` is [x, y, w, h] in 0..1 of the image. Head-and-shoulders photos are never cropped (the person
    box of a close-up can be just the middle of the face), and a crop always keeps the whole head."""
    if not box:
        return image, None
    W, H = image.size
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    if face:
        fx, fy, fw, fh = face[0] * W, face[1] * H, face[2] * W, face[3] * H
        if fh > 0.28 * bh or fh > 0.12 * H:
            return image, None
        # Whole head with hair inside the crop, whatever the person box says.
        x0, x1 = min(x0, fx - fw * 0.8), max(x1, fx + fw * 1.8)
        y0 = min(y0, fy - fh * 0.9)
        bw, bh = x1 - x0, y1 - y0
    left = max(0, x0 - bw * 0.35)
    right = min(W, x1 + bw * 0.35)
    top = max(0, y0 - bh * 0.12)
    # Room under the boots for a ball at his feet (a dribble shot cut through the ball looked broken).
    bottom = min(H, y1 + bh * 0.16)
    if (right - left) * (bottom - top) > 0.7 * W * H:
        return image, None
    crop = (round(left), round(top), round(right), round(bottom))
    return image.crop(crop), crop


def _percentile_levels(lum: np.ndarray) -> tuple[float, float]:
    lo, hi = np.percentile(lum, [0.4, 99.7])
    # Never crush a real dark kit or clip a white shirt: move the points only part of the way.
    return float(min(lo, 18) * 0.7), float(max(hi, 235) * 0.7 + 255 * 0.3)


def grade(image: Image.Image, weight: np.ndarray | None = None) -> Image.Image:
    """Balanced colour, clean levels, local contrast ("clarity"), a little vibrance and fine sharpening.

    `weight` (0..1 per pixel, e.g. the player matte) makes the statistics come from the player only."""
    if cv2 is None:
        return image
    rgb = np.asarray(image.convert("RGB")).astype(np.float32)
    w = weight if weight is not None else np.ones(rgb.shape[:2], np.float32)
    wsum = max(float(w.sum()), 1.0)

    # 1. White balance: pull the average of the mid-tones towards neutral, at most a few percent.
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    mids = w * ((lum > 50) & (lum < 205))
    if mids.sum() > 1000:
        mean = (rgb * mids[..., None]).reshape(-1, 3).sum(0) / mids.sum()
        gain = np.clip(mean.mean() / np.maximum(mean, 1), 0.94, 1.06)
        rgb *= 0.5 + 0.5 * gain  # half strength: fix casts, keep the light's mood

    # 2. Levels on luminance.
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    sample = lum[w > 0.5] if (w > 0.5).sum() > 1000 else lum.ravel()
    lo, hi = _percentile_levels(sample)
    rgb = (rgb - lo) * (255 / max(hi - lo, 1))
    rgb = np.clip(rgb, 0, 255)

    # 3. Local contrast on lightness only (CLAHE), blended in softly.
    lab = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2LAB)
    L = lab[:, :, 0]
    tiles = max(4, min(12, round(max(image.size) / 400)))
    clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(tiles, tiles)).apply(L)
    lab[:, :, 0] = (L.astype(np.float32) * 0.6 + clahe.astype(np.float32) * 0.4).astype(np.uint8)

    # 4. Vibrance: lift muted colours more than already strong ones (kit colours pop, skin stays skin).
    a = lab[:, :, 1].astype(np.float32) - 128
    b = lab[:, :, 2].astype(np.float32) - 128
    chroma = np.sqrt(a * a + b * b)
    boost = 1 + 0.14 * np.clip(1 - chroma / 60, 0, 1)
    lab[:, :, 1] = np.clip(a * boost + 128, 0, 255).astype(np.uint8)
    lab[:, :, 2] = np.clip(b * boost + 128, 0, 255).astype(np.uint8)
    out = Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))

    # 5. Fine sharpening, radius scaled to the image, with a threshold so skin and sky stay smooth.
    radius = max(0.8, max(image.size) / 2400)
    return out.filter(ImageFilter.UnsharpMask(radius=radius, percent=45, threshold=3))
