import base64
import json
import os
import sys
import time
from io import BytesIO

import numpy as np
import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "openai/clip-vit-base-patch16")

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME)
model.eval()

sys.stdout.write(json.dumps({"type": "ready", "model": MODEL_NAME}) + "\n")
sys.stdout.flush()


def handle_rank(req_id: str, params: dict) -> dict:
    prompt = params["prompt"]
    image_entries = params["images"]
    start = time.monotonic()

    images = [
        Image.open(BytesIO(base64.b64decode(entry["data"]))).convert("RGB")
        for entry in image_entries
    ]

    with torch.no_grad():
        text_inputs = processor(text=[prompt], return_tensors="pt", padding=True)
        image_inputs = processor(images=images, return_tensors="pt")
        outputs = model(
            input_ids=text_inputs["input_ids"],
            attention_mask=text_inputs["attention_mask"],
            pixel_values=image_inputs["pixel_values"],
        )
        text_emb = outputs.text_embeds[0].float().cpu().numpy()
        img_embs = outputs.image_embeds.float().cpu().numpy()

    text_norm = text_emb / np.linalg.norm(text_emb)
    results = []
    for entry, img_emb in zip(image_entries, img_embs):
        img_norm = img_emb / np.linalg.norm(img_emb)
        score = float(np.clip(np.dot(text_norm, img_norm), 0.0, 1.0))
        results.append({"key": entry["key"], "score": score})

    results.sort(key=lambda r: r["score"], reverse=True)

    duration_ms = int((time.monotonic() - start) * 1000)
    return {
        "id": req_id,
        "result": {
            "results": results,
            "meta": {
                "prompt": prompt,
                "total": len(image_entries),
                "cached": 0,
                "encoded": len(image_entries),
                "duration_ms": duration_ms,
            },
        },
    }


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    req_id = None
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
        sys.stderr.write(f"[clip_worker] error (id={req_id}): {e}\n")
        sys.stderr.flush()
        sys.stdout.write(json.dumps({"id": req_id, "error": str(e)}) + "\n")
        sys.stdout.flush()
