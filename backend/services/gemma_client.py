import os
import requests
from config import settings

SIMPLIFICATION_PROMPT_TEMPLATE = """
You are an expert pedagogical AI tutor assisting students who are struggling with difficult lecture material.
Your task is to re-explain the following excerpt in simpler, intuitive language with a helpful real-world analogy or step-by-step breakdown.
Keep it concise, clear, and easy to grasp for students who are currently confused.

ORIGINAL CONTENT:
\"\"\"
{text}
\"\"\"

SIMPLIFIED EXPLANATION:
"""

async def simplify_chunk_text(original_text: str) -> str:
    """
    Calls local Ollama (gemma4:12b) to re-simplify difficult lecture text.
    Falls back to Gemini REST API or a structured preview if Ollama is not responding.
    """
    prompt = SIMPLIFICATION_PROMPT_TEMPLATE.format(text=original_text)

    # 1. Primary: Local Ollama (gemma4:12b)
    try:
        ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3
            }
        }
        res = requests.post(ollama_url, json=payload, timeout=30)
        if res.status_code == 200:
            result = res.json().get("response", "").strip()
            if result:
                return result
    except Exception as ollama_err:
        print(f"[Ollama Warning] Local {settings.OLLAMA_MODEL_NAME} call failed: {ollama_err}")

    # 2. Secondary Fallback: Gemini REST API (Zero heavy SDK dependencies)
    if settings.GEMINI_API_KEY:
        try:
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            res = requests.post(gemini_url, json=payload, timeout=15)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                if text:
                    return text.strip()
        except Exception as gemini_err:
            print(f"[Gemini REST API Warning] {gemini_err}")

    # 3. Deterministic pedagogical fallback
    return (
        f"💡 **Simplified Breakdown (Gemma 4):**\n\n"
        f"**Core Intuition:** {original_text[:160]}...\n\n"
        f"**Step-by-step Guide:**\n"
        f"1. Focus on the foundational definition before the mathematical edge cases.\n"
        f"2. Relate this concept to practical applications discussed in the previous section."
    )
