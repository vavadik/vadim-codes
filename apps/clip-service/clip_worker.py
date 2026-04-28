import json
import os
import sys

from sentence_transformers import SentenceTransformer

MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "clip-ViT-B-32")

model = SentenceTransformer(MODEL_NAME)

sys.stdout.write(json.dumps({"type": "ready", "model": MODEL_NAME}) + "\n")
sys.stdout.flush()

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        req = json.loads(line)
        req_id = req.get("id")
        method = req.get("method")

        if method == "health":
            result = {"status": "ok", "model_loaded": True}
            sys.stdout.write(json.dumps({"id": req_id, "result": result}) + "\n")
        else:
            sys.stdout.write(json.dumps({"id": req_id, "error": f"unknown method: {method}"}) + "\n")

        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(json.dumps({"id": None, "error": str(e)}) + "\n")
        sys.stdout.flush()
