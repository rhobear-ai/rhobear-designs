#!/usr/bin/env python3
"""THE METHOD — image generation layer (Nano Banana Pro via Vertex, on our $1k credit).

Image-first is the foundation of the method: the agent GENERATES its frames first,
then builds the CSS/JS from the picture. This is the tool it calls to do that.

Model: gemini-3-pro-image-preview (Nano Banana Pro) — the top image model, always.
Credit: Vertex project `rhobear` (the $1k GenAI trial credit), location `global`.

Auth, in order:
  1. GOOGLE_APPLICATION_CREDENTIALS  — a service-account key (the shipped/server path).
  2. `gcloud auth print-access-token` — the owner's local path (account must have
     access to project `rhobear`, e.g. dearien.campbell@sunsponge.co).

Usage:
    python generate.py "PROMPT" --out frame.png [--aspect 16:9] [--n 1] [--ref img.png ...]

Writes real PNG(s). Prints the path(s) it wrote, one per line, on success.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import urllib.request
import urllib.error

PROJECT = os.environ.get("METHOD_VERTEX_PROJECT", "rhobear")
LOCATION = "global"  # Nano Banana Pro is served from the global endpoint
MODEL = os.environ.get("METHOD_IMAGE_MODEL", "gemini-3-pro-image-preview")
ENDPOINT = (
    f"https://aiplatform.googleapis.com/v1/projects/{PROJECT}"
    f"/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
)


def _access_token() -> str:
    """Bearer token for Vertex — SA key if configured, else the local gcloud auth."""
    sa = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if sa and os.path.isfile(sa):
        # Mint a token from the SA key without extra deps (google-auth if present,
        # else gcloud with the key activated).
        try:
            from google.oauth2 import service_account  # type: ignore
            from google.auth.transport.requests import Request  # type: ignore

            creds = service_account.Credentials.from_service_account_file(
                sa, scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )
            creds.refresh(Request())
            return creds.token
        except Exception:
            pass
    # Local path: the owner's gcloud, on an account with project `rhobear` access.
    # Resolve the binary (gcloud is `gcloud.cmd` on Windows — a bare name fails).
    gcloud = shutil.which("gcloud") or "gcloud"
    out = subprocess.run(
        [gcloud, "auth", "print-access-token"],
        capture_output=True, text=True, timeout=30, shell=(os.name == "nt"),
    )
    if out.returncode != 0 or not out.stdout.strip():
        raise SystemExit(
            "no Vertex auth: set GOOGLE_APPLICATION_CREDENTIALS to an SA key with "
            "project `rhobear` access, or `gcloud auth login` an account that has it."
        )
    return out.stdout.strip()


def generate(prompt: str, out: str, *, aspect: str = "16:9", n: int = 1,
             refs: list[str] | None = None) -> list[str]:
    token = _access_token()

    # Nano Banana Pro takes the aspect ratio as a generationConfig hint; we also
    # state it in the prompt so the model honours it even where the field is ignored.
    parts: list[dict] = [{"text": f"{prompt}\n\nAspect ratio: {aspect}."}]
    for r in (refs or []):
        with open(r, "rb") as fh:
            parts.append({
                "inlineData": {
                    "mimeType": "image/png",
                    "data": base64.b64encode(fh.read()).decode(),
                }
            })

    body = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": aspect},
            "candidateCount": max(1, n),
        },
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        resp = json.loads(urllib.request.urlopen(req, timeout=180).read().decode())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Vertex {e.code}: {e.read().decode()[:400]}")

    written: list[str] = []
    base, ext = os.path.splitext(out)
    ext = ext or ".png"
    idx = 0
    for cand in resp.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            data = part.get("inlineData", {}).get("data")
            if not data:
                continue
            path = out if idx == 0 else f"{base}-{idx+1}{ext}"
            with open(path, "wb") as fh:
                fh.write(base64.b64decode(data))
            written.append(path)
            idx += 1
    if not written:
        raise SystemExit(f"no image in response: {json.dumps(resp)[:400]}")
    return written


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate images with Nano Banana Pro (Vertex, rhobear credit).")
    ap.add_argument("prompt")
    ap.add_argument("--out", required=True, help="output PNG path")
    ap.add_argument("--aspect", default="16:9", help="e.g. 16:9, 9:16, 1:1, 4:3")
    ap.add_argument("--n", type=int, default=1, help="number of variations")
    ap.add_argument("--ref", action="append", default=[], help="reference image(s) for consistency")
    a = ap.parse_args()
    for p in generate(a.prompt, a.out, aspect=a.aspect, n=a.n, refs=a.ref):
        print(p)


if __name__ == "__main__":
    main()
