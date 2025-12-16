import json
import requests
from fastapi import HTTPException
from typing import List, Dict, Any, Optional

from app.config import Settings


def groq_chat(
    messages: List[Dict[str, str]],
    settings: Settings,
    schema: Optional[Dict[str, Any]] = None,
    timeout: int = 45,
) -> str:
    """Call Groq chat API and return text content."""
    if not settings.groq_api_key:
        raise HTTPException(500, "GROQ_API_KEY not set")

    payload: Dict[str, Any] = {"model": settings.groq_model, "messages": messages}

    if schema:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": {"name": "cv", "strict": True, "schema": schema},
        }
    else:
        payload["response_format"] = {"type": "json_object"}

    r = requests.post(
        settings.groq_url,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {settings.groq_api_key}"},
        json=payload,
        timeout=timeout,
    )
    if not r.ok:
        raise HTTPException(r.status_code, r.text)

    data = r.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not text:
        raise HTTPException(502, "Empty AI response")
    return text


def generate_json(system: str, user: str, schema: dict, settings: Settings, timeout: int = 45) -> dict:
    text = groq_chat(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        settings=settings,
        schema=schema,
        timeout=timeout,
    )
    try:
        return json.loads(text)
    except Exception:
        raise HTTPException(502, "Model returned non-JSON output")
