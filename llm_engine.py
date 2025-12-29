import os
import requests
import json
from system_prompt import SYSTEM_PROMPT

API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    raise RuntimeError("GOOGLE_API_KEY not set")

URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent?key=" + API_KEY
)


# =========================
# MAIN ENTRY
# =========================
def run_ux_engine(user_prompt: str):
    """
    1. Try Gemini
    2. Validate output
    3. If anything fails -> deterministic fallback
    """

    # --- Try AI first ---
    try:
        ai_result = call_gemini(user_prompt)

        # Validate AI output
        if is_valid_ui(ai_result):
            return {
                "status": "ok",
                "source": "ai",
                "ui": ai_result
            }

    except Exception:
        pass

    # --- Always fallback safely ---
    return {
        "status": "ok",
        "source": "fallback",
        "ui": deterministic_fallback(user_prompt)
    }


# =========================
# GEMINI CALL
# =========================
def call_gemini(user_prompt: str):
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": SYSTEM_PROMPT + "\nUSER_INTENT:\n" + user_prompt
                    }
                ]
            }
        ]
    }

    response = requests.post(
        URL,
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=30
    )

    # Rate limit → fallback
    if response.status_code == 429:
        raise RuntimeError("Rate limited")

    response.raise_for_status()

    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    return json.loads(text)


# =========================
# VALIDATION
# =========================
def is_valid_ui(data):
    """
    Ensures AI output has real components
    """
    if not isinstance(data, dict):
        return False

    sections = data.get("sections")
    if not sections or not isinstance(sections, list):
        return False

    return len(sections) > 0


# =========================
# DETERMINISTIC FALLBACK
# =========================
def deterministic_fallback(prompt: str):
    p = prompt.lower()

    components = []

    # HERO
    components.append({
        "type": "Hero",
        "title": "Analytics Dashboard",
        "subtitle": "High-level business insights"
    })

    # STATS
    if any(w in p for w in ["kpi", "metric", "stats", "revenue", "users"]):
        components.append({
            "type": "StatCards",
            "items": [
                {"label": "Revenue", "value": "$124k"},
                {"label": "Users", "value": "8.4k"},
                {"label": "Growth", "value": "+12%"}
            ]
        })

    # CHART
    if any(w in p for w in ["chart", "graph", "growth", "analytics"]):
        components.append({
            "type": "Chart",
            "chartType": "line",
            "title": "Monthly Growth"
        })

    # HARD GUARANTEE
    if not components:
        components.append({
            "type": "Placeholder",
            "message": "Default dashboard layout"
        })

    return {
        "layout": "dashboard",
        "components": components
    }
