"""AI upscale of a WHOLE photo (Real-ESRGAN, services/upscale), not only the player's cutout.

  fullup.py full <in> <out.jpg>
      For the natural looks, which show the photo's real surroundings (grass, stands) around the cutout:
      small photos (long side < 2200, the cutout's own rule) are upscaled 4x so the ground is as sharp as
      the player. Prints {"scale": s} (out width / in width), or {"scale": 1} and writes nothing when the
      photo is already big enough.

  fullup.py restore <in> <out.jpg>
      "Melhorar com IA": for big but soft photos. The photo is first brought down to ~1400px (where its
      real detail is), then upscaled 4x: Real-ESRGAN rebuilds crisp edges from the soft ones instead of
      enlarging the blur. The result replaces the photo (the original file is kept).

Neither lets the AI repaint the photo: the AI's edges are kept and the photo's own fine texture (skin,
grass, walls) is put back over them (with_texture), and nothing redraws the face: Real-ESRGAN only sharpens what is in the pixels.
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ESRGAN = os.path.join(HERE, "..", "upscale", "bin", "realesrgan-ncnn-vulkan")
ESRGAN_MODELS = os.path.join(HERE, "..", "upscale", "bin", "models")
UPSCALE_BELOW = 2200
RESTORE_SIDE = 1400
MAX_SIDE = 4000


def esrgan(image: Image.Image) -> tuple[Image.Image, Image.Image]:
    """The Real-ESRGAN 4x result and the plain Lanczos 4x resize, same size."""
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, "in.png"), os.path.join(tmp, "out.png")
        image.save(src)
        subprocess.run([ESRGAN, "-i", src, "-o", dst, "-n", "realesrgan-x4plus", "-m", ESRGAN_MODELS], check=True, capture_output=True, timeout=900)
        ai = Image.open(dst).convert("RGB")
    return ai, image.resize(ai.size, Image.LANCZOS)


def with_texture(ai: Image.Image, plain: Image.Image) -> Image.Image:
    """The AI's crisp edges with the photo's own fine texture put back. Real-ESRGAN takes stucco, knit and
    grass grain for compression noise and flattens them (even blended at 55% the walls came out smooth):
    where the plain resize has more detail than the AI result, that difference is added back. The detail is
    measured up to ~8px of the 4x image (2 source px): stucco and grass grain are that coarse; at 3px the
    walls stayed smooth."""
    a = np.asarray(ai).astype(np.float32)
    p = np.asarray(plain).astype(np.float32)
    hp = p - np.asarray(plain.filter(ImageFilter.GaussianBlur(8))).astype(np.float32)
    ha = a - np.asarray(ai.filter(ImageFilter.GaussianBlur(8))).astype(np.float32)
    out = a + np.clip(hp - ha, -50, 50) * (np.abs(ha) < np.abs(hp))
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def main(mode: str, src: str, out: str) -> None:
    image = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w0 = image.width
    if mode == "full" and max(image.size) >= UPSCALE_BELOW:
        print(json.dumps({"scale": 1}))
        return
    if mode == "restore" and max(image.size) > RESTORE_SIDE:
        k = RESTORE_SIDE / max(image.size)
        image = image.resize((round(image.width * k), round(image.height * k)), Image.LANCZOS)
    ai, plain = esrgan(image)
    up = with_texture(ai, plain)
    k = MAX_SIDE / max(up.size)
    if k < 1:
        up = up.resize((round(up.width * k), round(up.height * k)), Image.LANCZOS)
    up.save(out, quality=93, subsampling=0)
    print(json.dumps({"scale": up.width / w0, "width": up.width, "height": up.height}))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
