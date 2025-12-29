import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent?key=" + GOOGLE_API_KEY
    if GOOGLE_API_KEY else None
)

# =========================
# SYSTEM PROMPT (CRITICAL)
# =========================
SYSTEM_PROMPT = """
You are a senior product designer and UX architect.

Your job:
- Understand the user's intent
- Decide page structure yourself
- Decide tone and visual direction
- Decide which sections are necessary
- Include image intent for each section

RULES:
- No templates
- No assumptions unless necessary
- Output ONLY valid JSON
- JSON MUST contain:
  - layout
  - tone
  - components (array, never empty)

Each component MUST include:
- type
- purpose
- editable
- content
- imageIntent
"""

# =========================
# GEMINI CALL
# =========================
def call_gemini(prompt: str):
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": SYSTEM_PROMPT + "\n\nUSER REQUEST:\n" + prompt
                    }
                ]
            }
        ]
    }

    r = requests.post(
        GEMINI_URL,
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30
    )

    if r.status_code != 200:
        raise RuntimeError("Gemini request failed")

    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)

# =========================
# REPAIR LOGIC (KEY PART)
# =========================
def repair_design(design: dict):
    if "layout" not in design:
        design["layout"] = "vertical"

    if "tone" not in design:
        design["tone"] = "professional"

    components = design.get("components", [])

    # HARD GUARANTEE: at least one component
    if not components:
        components = [{
            "type": "Hero",
            "purpose": "Initial positioning",
            "editable": True,
            "content": {
                "headline": "Build Better Digital Experiences",
                "subtext": "Designed with clarity and intent"
            },
            "imageIntent": "abstract, modern"
        }]

    # Repair each component
    for c in components:
        c.setdefault("editable", True)
        c.setdefault("imageIntent", "abstract")
        c.setdefault("content", {})
        c.setdefault("purpose", "content section")

    design["components"] = components
    return design

# =========================
# ABSOLUTE FALLBACK
# =========================
def emergency_default():
    return {
        "layout": "vertical",
        "tone": "professional",
        "components": [
            {
                "type": "Hero",
                "purpose": "Default fallback",
                "editable": True,
                "content": {
                    "headline": "Professional Digital Product",
                    "subtext": "High-quality default experience"
                },
                "imageIntent": "abstract, clean"
            }
        ]
    }

# =========================
# MAIN GENERATOR
# =========================
def generate_design(prompt: str):
    if GEMINI_URL:
        try:
            design = call_gemini(prompt)
            return repair_design(design)
        except Exception:
            pass

    return emergency_default()

# =========================
# API
# =========================
@app.route("/design", methods=["POST"])
def design():
    prompt = (request.json or {}).get("prompt", "")
    output = generate_design(prompt)
    return jsonify(output)

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
