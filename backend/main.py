import os, json, requests
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv, find_dotenv
import re
from typing import Optional, Dict, Any, List, Tuple


load_dotenv(dotenv_path=find_dotenv(), override=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- existing ----------
class PromptIn(BaseModel):
    prompt: str

class SeedIn(BaseModel):
    name: str
    title: str | None = ""
    bio: str = Field(default_factory=str)

SEED_SCHEMA = {
  "type":"object",
  "properties":{
    "summary":{"type":"string"},
    "skills":{"type":"array","items":{"type":"string"}}
  },
  "required":["summary","skills"],
  "additionalProperties": False
}

def gemini_json(system: str, user: str, schema: dict):
    key = get_api_key()
    payload = {
        "systemInstruction": {"parts": [{"text": system}]},
        "generationConfig": {"response_mime_type":"application/json","response_schema": schema},
        "contents": [{"parts": [{"text": user}]}]
    }
    r = requests.post(
        GEMINI_URL,
        headers={"Content-Type": "application/json","x-goog-api-key": key},
        json=payload, timeout=30
    )
    if not r.ok:
        raise HTTPException(r.status_code, r.text)
    data = r.json()
    text = data.get("candidates",[{}])[0].get("content",{}).get("parts",[{}])[0].get("text","")
    if not text:
        raise HTTPException(502, "Empty AI response")
    try:
        return json.loads(text)
    except Exception:
        raise HTTPException(502, "Model returned non-JSON output")

@app.post("/api/seed-cv")
def seed_cv(body: SeedIn):
    system = (
      "You write concise CV summaries and extract skills. "
      "Return JSON with {summary:string, skills:string[]} only. "
      "Summary: 2–3 sentences, specific, ATS-friendly. "
      "Skills: 5–12 canonical tech or soft skills from the bio/title."
    )
    user = f"""
Name: {body.name}
Title: {body.title or ""}
Bio: {body.bio.strip()}
"""
    seed = gemini_json(system, user, SEED_SCHEMA)

    # Build a valid CvData with empty lists for the rest
    cv = {
      "fullName": body.name,
      "title": body.title or "",
      "summary": seed.get("summary",""),
      "contacts": {"email":"", "phone":"", "location":"", "links":[]},
      "skills": seed.get("skills", []),
      "experience": [],
      "education": [],
      "projects": [],
      "languages": []
    }
    return cv

def get_api_key() -> str:
    v = os.getenv("GEMINI_API_KEY")
    if not v:
        raise HTTPException(500, "GEMINI_API_KEY not set")
    return v

@app.post("/api/generate")
def generate(body: PromptIn):
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not set")
    try:
        r = requests.post(
            GEMINI_URL,
            headers={"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": body.prompt}]}]} ,
            timeout=30,
        )
        if not r.ok:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        data = r.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return {"output": text or "[empty]"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

# ---------- NEW: CV endpoints with structured JSON ----------

# 1) Define a JSON schema (kept simple; align with your frontend CvData)
CV_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "fullName": {"type": "string"},
        "title": {"type": "string"},
        "summary": {"type": "string"},
        "contacts": {
            "type": "object",
            "properties": {
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "location": {"type": "string"},
                "links": {"type": "array", "items": {"type": "string"}}
            }
        },
        "skills": {"type": "array", "items": {"type": "string"}},
        "experience": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "role": {"type": "string"},
                    "company": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"},
                    "bullets": {"type": "array", "items": {"type": "string"}},
                    "tech": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["role", "company", "bullets", "tech"]
            }
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "school": {"type": "string"},
                    "program": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"}
                },
                "required": ["school", "program"]
            }
        },
        "projects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "url": {"type": "string"},
                    "bullets": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["name", "bullets"]
            }
        },
        "languages": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "level": {"type": "string"}
                },
                "required": ["name", "level"]
            }
        }
    },
    "required": [
        "fullName","title","summary","contacts","skills",
        "experience","education","projects","languages"
    ]
}


class ExtractIn(BaseModel):
    free_text: str

class ImproveIn(BaseModel):
    current_cv: dict
    job_text: str | None = ""

def _gemini_json_call(system_instruction: str, user_prompt: str, schema: dict):
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not set")
    payload = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": schema
        },
        "contents": [{"parts": [{"text": user_prompt}]}]
    }
    r = requests.post(
        GEMINI_URL,
        headers={"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY},
        json=payload,
        timeout=45,
    )
    if not r.ok:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    data = r.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    if not text:
        raise HTTPException(502, "Empty AI response")
    try:
        return json.loads(text)
    except Exception:
        # If model returns stray prose, ask it to “JSON only” in your prompt or re-try here
        raise HTTPException(502, "Model returned non-JSON output")

# ===== Normalizer block starts here (top-level, no indentation) =====
_DATE_RE = re.compile(r"\b(19|20)\d{2}(?:-(0[1-9]|1[0-2]))?\b")

def _pick_year_or_year_month(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    s = str(value)
    # collapse common range notations like "2024-2025", "2024 – 2025", "2024 to 2025"
    rng = re.search(r"\b((?:19|20)\d{2})\s*(?:-|–|—|to|until|through)\s*((?:19|20)\d{2})\b", s, re.IGNORECASE)
    if rng:
        # caller decides which side is start/end; here we just return start/end via caller
        # we only extract one side in this function, so just return the first match
        return rng.group(1)

    m = _DATE_RE.search(s)
    return m.group(0) if m else None

def _extract_range(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Pull 'YYYY' or 'YYYY-MM' start/end from free text like '2024-2025'."""
    if not text:
        return (None, None)
    t = str(text)
    rng = re.search(r"\b((?:19|20)\d{2})(?:-(0[1-9]|1[0-2]))?\s*(?:-|–|—|to|until|through)\s*((?:19|20)\d{2})(?:-(0[1-9]|1[0-2]))?\b", t, re.IGNORECASE)
    if rng:
        start = f"{rng.group(1)}{('-' + rng.group(2)) if rng.group(2) else ''}"
        end = f"{rng.group(3)}{('-' + rng.group(4)) if rng.group(4) else ''}"
        return (start, end)
    # fallback: single date somewhere in text
    single = _DATE_RE.search(t)
    if single:
        return (single.group(0), None)
    return (None, None)

def _clean_bullets(bullets: List[str]) -> List[str]:
    out = []
    for b in bullets[:5]:  # cap length
        b = re.sub(r"^\s*[-•]\s*", "", str(b)).strip()
        if not b:
            continue
        # cap length but keep words intact
        if len(b) > 160:
            b = b[:160].rsplit(" ", 1)[0]
        out.append(b)
    return out

def _normalize_experience(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    norm: List[Dict[str, Any]] = []

    for it in items or []:
        role = (it.get("role") or "").strip()
        company = (it.get("company") or "").strip()
        start_raw = it.get("start")
        end_raw = it.get("end")

        # If model stuffed a range into one field, try to split it
        s_from_text, e_from_text = (None, None)
        if isinstance(start_raw, str) and any(sep in start_raw for sep in ["-", "–", "—", "to", "until", "through"]):
            s_from_text, e_from_text = _extract_range(start_raw)
        elif isinstance(end_raw, str) and any(sep in end_raw for sep in ["-", "–", "—", "to", "until", "through"]):
            s_from_text, e_from_text = _extract_range(end_raw)

        start = _pick_year_or_year_month(s_from_text or start_raw)
        end = _pick_year_or_year_month(e_from_text or end_raw)

        # normalize bullets/tech
        bullets = _clean_bullets(it.get("bullets") or [])
        tech = [t.strip() for t in (it.get("tech") or []) if str(t).strip()][:12]

        key = (role.lower(), company.lower(), start or "", end or "")
        if not role or not company:
            continue  # skip incomplete entries
        if key in seen:
            continue  # dedupe
        seen.add(key)

        norm.append({
            "role": role,
            "company": company,
            **({"start": start} if start else {}),
            **({"end": end} if end else {}),
            "bullets": bullets,
            "tech": tech,
        })

    return norm

def _normalize_cv(cv: Dict[str, Any]) -> Dict[str, Any]:
    """Coerce model output to safe, consistent shapes."""
    if not isinstance(cv, dict):
        return cv
    cv = dict(cv)  # shallow copy

    # Experience
    cv["experience"] = _normalize_experience(cv.get("experience") or [])

    # Contacts safety
    contacts = cv.get("contacts") or {}
    cv["contacts"] = {
        "email": str(contacts.get("email") or ""),
        "phone": str(contacts.get("phone") or ""),
        "location": str(contacts.get("location") or ""),
        "links": [str(x).strip() for x in (contacts.get("links") or []) if str(x).strip()][:10],
    }

    # Skills trimming
    cv["skills"] = [str(s).strip() for s in (cv.get("skills") or []) if str(s).strip()][:30]

    # Education/projects/languages pass-through (optional: similar normalization)
    for k in ("education", "projects", "languages"):
        if k not in cv or not isinstance(cv[k], list):
            cv[k] = []

    # Strings fallback
    for k in ("fullName", "title", "summary"):
        cv[k] = str(cv.get(k) or "")

    return cv

@app.post("/api/extract-cv")
def extract_cv(body: ExtractIn):
    system = "You are a CV extractor. Output strictly valid JSON conforming to the provided schema."
    user = f"""Convert the user's free text into the CV schema.

Rules:
- JSON ONLY (no prose).
- Emit exactly one experience item per distinct role@company mentioned. Do NOT split a single internship/job into multiple entries.
- Dates MUST be either "YYYY" or "YYYY-MM" only. Never include day or time.
- If the user writes a range like "2024-2025", set start="2024", end="2025".
- If month is unknown, use just "YYYY".
- Do NOT invent employers or dates. Omit unknown fields.
- Bullets: 2–5 items, action + outcome, ≤ 20 words each.

User text:
\"\"\"{body.free_text}\"\"\""""
    raw = _gemini_json_call(system, user, CV_JSON_SCHEMA)
    return _normalize_cv(raw)

@app.post("/api/improve-cv")
def improve_cv(body: ImproveIn):
    system = "You are a CV editor. Improve clarity and impact, keep facts. JSON only, same schema as input."
    user = f"""Improve the following CV JSON for concision and impact. Keep the same keys/shape.
Current CV:
{json.dumps(body.current_cv)}

Job (optional, for tailoring):
\"\"\"{body.job_text or ""}\"\"\""""
    raw = _gemini_json_call(system, user, CV_JSON_SCHEMA)
    return _normalize_cv(raw)
