import json
import os
import sys
import time
from io import BytesIO

import numpy as np
import requests
from PIL import Image
from sentence_transformers import SentenceTransformer

MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "clip-ViT-B-32")

model = SentenceTransformer(MODEL_NAME)

sys.stdout.write(json.dumps({"type": "ready", "model": MODEL_NAME}) + "\n")
sys.stdout.flush()


def fetch_and_preprocess(url: str) -> Image.Image:
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    img = Image.open(BytesIO(resp.content)).convert("RGB")
    w, h = img.size
    if w <= h:
        new_w, new_h = 256, int(h * 256 / w)
    else:
        new_w, new_h = int(w * 256 / h), 256
    return img.resize((new_w, new_h), Image.LANCZOS)


def handle_rank(req_id: str, params: dict) -> dict:
    prompt = params["prompt"]
    image_urls = params["images"]
    start = time.monotonic()

    images = []
    for url in image_urls:
        try:
            images.append(fetch_and_preprocess(url))
        except Exception:
            return {"id": req_id, "error": f"IMAGE_FETCH_FAILED: {url}"}

    text_emb = model.encode([prompt])[0]
    img_embs = model.encode(images)

    text_norm = text_emb / np.linalg.norm(text_emb)
    results = []
    for url, img_emb in zip(image_urls, img_embs):
        img_norm = img_emb / np.linalg.norm(img_emb)
        score = float(np.clip(np.dot(text_norm, img_norm), 0.0, 1.0))
        results.append({"url": url, "score": score})

    results.sort(key=lambda r: r["score"], reverse=True)

    duration_ms = int((time.monotonic() - start) * 1000)
    return {
        "id": req_id,
        "result": {
            "results": results,
            "meta": {
                "prompt": prompt,
                "total": len(image_urls),
                "cached": 0,
                "encoded": len(image_urls),
                "duration_ms": duration_ms,
            },
        },
    }


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        req = json.loads(line)
        req_id = req.get("id")
        method = req.get("method")

        if method == "health":
            sys.stdout.write(json.dumps({"id": req_id, "result": {"status": "ok", "model_loaded": True}}) + "\n")
        elif method == "rank":
            sys.stdout.write(json.dumps(handle_rank(req_id, req.get("params", {}))) + "\n")
        else:
            sys.stdout.write(json.dumps({"id": req_id, "error": f"unknown method: {method}"}) + "\n")

        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(json.dumps({"id": None, "error": str(e)}) + "\n")
        sys.stdout.flush()
