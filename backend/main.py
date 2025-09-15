import os, json, requests
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv, find_dotenv

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

@app.post("/api/extract-cv")
def extract_cv(body: ExtractIn):
    system = "You are a CV extractor. Output strictly valid JSON conforming to the provided schema."
    user = f"""Convert the user's free text into the CV schema. 
Rules:
- JSON only (no prose).
- 2–5 bullets per role, action + result, ≤ 20 words each.
- Do not invent dates/employers; omit if unknown.
- Use ISO dates (YYYY or YYYY-MM) when present.

User text:
\"\"\"{body.free_text}\"\"\""""
    return _gemini_json_call(system, user, CV_JSON_SCHEMA)

@app.post("/api/improve-cv")
def improve_cv(body: ImproveIn):
    system = "You are a CV editor. Improve clarity and impact, keep facts. JSON only, same schema as input."
    user = f"""Improve the following CV JSON for concision and impact. Keep the same keys/shape.
Current CV:
{json.dumps(body.current_cv)}

Job (optional, for tailoring):
\"\"\"{body.job_text or ""}\"\"\""""
    return _gemini_json_call(system, user, CV_JSON_SCHEMA)
