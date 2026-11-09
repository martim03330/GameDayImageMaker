"""Local scenery generator (FLUX.1 schnell, 4-bit, on the Mac's GPU via mflux).

Only scenery is generated — stands, floodlights, tunnels, smoke — never people: the player in an
edit is always the real photo. The prompts come from the app (src/lib/scenes.ts), which varies them.

Usage: python backgrounds.py <job.json>
  job.json = {"out": "<dir>", "items": [{"kind": "night", "prompt": "...", "seed": 123}, ...]}
Prints "<kind> <path>" for each image as soon as it is written.
"""

import json
import os
import sys

from mflux.models.common.config import ModelConfig
from mflux.models.flux.variants.txt2img.flux import Flux1

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(HERE, "models", "flux-schnell-4bit")


def main() -> None:
    with open(sys.argv[1]) as f:
        job = json.load(f)
    os.makedirs(job["out"], exist_ok=True)
    flux = Flux1(model_config=ModelConfig.schnell(), model_path=MODEL)
    for item in job["items"]:
        image = flux.generate_image(seed=item["seed"], prompt=item["prompt"], num_inference_steps=4, width=1024, height=1280)
        path = os.path.join(job["out"], f"{item['kind']}_{item['seed']}.png")
        image.save(path=path, export_json_metadata=False)
        print(f"{item['kind']} {path}", flush=True)


if __name__ == "__main__":
    main()
    os._exit(0)
