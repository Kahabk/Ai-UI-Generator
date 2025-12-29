from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import random
import hashlib
import requests

# ======================================================
# APP
# ======================================================

app = FastAPI(title="Advanced AI UI Generator (Gemini)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# CONFIG
# ======================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash-lite:generateContent"
    f"?key={GEMINI_API_KEY}"
)

# ======================================================
# SCHEMA
# ======================================================

class GenerateRequest(BaseModel):
    prompt: str

# ======================================================
# GEMINI CALL (STRICT JSON)
# ======================================================

def call_gemini_json(prompt: str):
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json"
        }
    }

    res = requests.post(
        GEMINI_URL,
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=60
    )

    res.raise_for_status()
    data = res.json()

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)

# ======================================================
# AI MODULES
# ======================================================

def llm_intent(prompt: str) -> dict:
    q = f"""
Return ONLY valid JSON.

Schema:
{{
  "industry": string,
  "tone": string,
  "mode": "dark" | "light",
  "wants_trust": boolean,
  "wants_case_studies": boolean
}}

User prompt:
{prompt}
"""
    return call_gemini_json(q)

def llm_plan(intent: dict) -> list:
    q = f"""
Return ONLY a JSON array.

Allowed sections:
["hero","credibility","services","workflow","case_studies","cta"]

Intent:
{json.dumps(intent)}
"""
    return call_gemini_json(q)

def llm_copy(section: str, intent: dict) -> dict:
    q = f"""
Return ONLY JSON.

Generate premium landing page copy.

Section: {section}
Industry: {intent["industry"]}
Tone: {intent["tone"]}
Brand name: Kahab
"""
    return call_gemini_json(q)

# ======================================================
# THEME ENGINE
# ======================================================

def generate_theme(intent):
    dark = intent["mode"] == "dark"
    return {
        "mode": intent["mode"],
        "colors": {
            "primary": "#D4AF37" if dark else "#2563EB",
            "background": "#0B0B0B" if dark else "#FFFFFF",
            "surface": "#111827",
            "text": "#F9FAFB" if dark else "#111827"
        },
        "fonts": {
            "heading": "Inter",
            "body": "Inter"
        }
    }

# ======================================================
# ASSET ENGINE (FREE IMAGES)
# ======================================================

IMAGE_POOL = [
    "https://picsum.photos/1400/900?random=11",
    "https://picsum.photos/1400/900?random=12",
    "https://picsum.photos/1400/900?random=13"
]

def pick_image():
    return random.choice(IMAGE_POOL)

# ======================================================
# SECTION BUILDER
# ======================================================

def build_section(section: str, intent: dict):
    s = {"type": section}

    if section == "hero":
        s["content"] = llm_copy("hero", intent)
        s["image"] = pick_image()

    elif section == "credibility":
        s["stats"] = ["AI-first engineering", "Production-grade systems", "Trusted expertise"]

    elif section == "services":
        s["items"] = [
            "AI Model Development",
            "Machine Learning Systems",
            "UI/UX Engineering",
            "Custom AI Solutions"
        ]

    elif section == "workflow":
        s["steps"] = ["Discovery", "Design", "Build", "Deploy"]

    elif section == "case_studies":
        s["examples"] = llm_copy("case_studies", intent)

    elif section == "cta":
        s["content"] = llm_copy("cta", intent)

    return s

# ======================================================
# API
# ======================================================

@app.post("/generate-landing-page")
def generate(req: GenerateRequest):
    intent = llm_intent(req.prompt)
    plan = llm_plan(intent)

    page = {
        "meta": {
            "engine": "gemini-2.0-flash-lite-ui-agent",
            "brand": "Kahab",
            "hash": hashlib.md5(req.prompt.encode()).hexdigest()
        },
        "intent": intent,
        "theme": generate_theme(intent),
        "layout": {
            "max_width": 1200,
            "grid": "12-column"
        },
        "sections": []
    }

    for sec in plan:
        page["sections"].append(build_section(sec, intent))

    return page
