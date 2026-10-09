import os
import google.generativeai as genai
from config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

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
    Calls Gemma 4 / Gemini API to re-simplify difficult lecture text.
    Falls back to a structured mock response if no API key is provided.
    """
    if not settings.GEMINI_API_KEY:
        return (
            f"💡 **Simplified Breakdown:**\n\n"
            f"In simple terms: {original_text[:140]}...\n\n"
            f"**Key Takeaway:** Break the concept into smaller, digestible components and focus on the primary definition first."
        )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash") # Or configured gemma endpoint
        prompt = SIMPLIFICATION_PROMPT_TEMPLATE.format(text=original_text)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"💡 **Simplified Note:** {original_text[:120]} (Simplified preview: focuses on core mechanisms)."
