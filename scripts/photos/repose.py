"""Adds pose / facing / legs to photos already cut out (no need to redo the whole treatment).
Usage: services/cutout/.venv/bin/python scripts/photos/repose.py"""
import json
import os
import sqlite3
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "services", "cutout"))
import pose  # noqa: E402
from PIL import Image  # noqa: E402

db = sqlite3.connect("data/gameday.db")
for pid, cut, meta in db.execute("SELECT id, cutout, meta FROM photos WHERE kind='player' AND cutout_status='done'").fetchall():
    m = json.loads(meta or "{}")
    body = pose.detect(Image.open(os.path.join("data/files", cut)))
    m.update({k: body[k] for k in ("pose", "facing", "back", "legs") if k in body})
    db.execute("UPDATE photos SET meta = ? WHERE id = ?", (json.dumps(m), pid))
    db.commit()
    print(cut, body.get("pose"), body.get("legs"))
sys.stdout.flush()
os._exit(0)
