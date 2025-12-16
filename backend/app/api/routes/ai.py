from fastapi import APIRouter, HTTPException, Depends
from models.schemas import PromptIn, SeedIn, ExtractIn, ImproveIn, CV_JSON_SCHEMA
from services.ai_client import groq_chat, generate_json
from services.cv_normalizer import normalize_cv
from app.deps import settings_dep, current_user

router = APIRouter(prefix="/api", tags=["ai"])


@router.post("/generate")
def generate(body: PromptIn, settings=Depends(settings_dep)):
    try:
        text = groq_chat([{"role": "user", "content": body.prompt}], settings=settings, timeout=30)
        return {"output": text or "[empty]"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/seed-cv")
def seed_cv(body: SeedIn, settings=Depends(settings_dep)):
    system = (
        "You write concise CV summaries and extract skills. "
        "Return JSON with {summary:string, skills:string[]} only. "
        "Summary: 2-3 sentences, specific, ATS-friendly. "
        "Skills: 5-12 canonical tech or soft skills from the bio/title."
    )
    user = f"""
Name: {body.name}
Title: {body.title or ""}
Bio: {body.bio.strip()}
"""
    seed = generate_json(system, user, CV_JSON_SCHEMA, settings=settings, timeout=30)

    cv = {
        "fullName": body.name,
        "title": body.title or "",
        "summary": seed.get("summary", ""),
        "contacts": {"email": "", "phone": "", "location": "", "links": []},
        "skills": seed.get("skills", []),
        "experience": [],
        "education": [],
        "projects": [],
        "languages": [],
    }
    return cv


@router.post("/extract-cv")
def extract_cv(body: ExtractIn, settings=Depends(settings_dep), user=Depends(current_user)):
    system = "You are a CV extractor. Output strictly valid JSON conforming to the provided schema."
    user = f"""Convert the user's free text into the CV schema.

Rules:
- JSON ONLY (no prose).
- Emit exactly one experience item per distinct role@company mentioned. Do NOT split a single internship/job into multiple entries.
- Dates MUST be either "YYYY" or "YYYY-MM" only. Never include day or time.
- If the user writes a range like "2024-2025", set start="2024", end="2025".
- If month is unknown, use just "YYYY".
- Do NOT invent employers or dates. Omit unknown fields.
- Bullets: 2-5 items, action + outcome, ~20 words each.

User text:
\"\"\"{body.free_text}\"\"\""""
    raw = generate_json(system, user, CV_JSON_SCHEMA, settings=settings, timeout=45)
    return normalize_cv(raw)


@router.post("/improve-cv")
def improve_cv(body: ImproveIn, settings=Depends(settings_dep), user=Depends(current_user)):
    system = "You are a CV editor. Improve clarity and impact, keep facts. JSON only, same schema as input."
    user = f"""Improve the following CV JSON for concision and impact. Keep the same keys/shape.
Current CV:
{body.current_cv}

Job (optional, for tailoring):
\"\"\"{body.job_text or ""}\"\"\""""
    raw = generate_json(system, user, CV_JSON_SCHEMA, settings=settings, timeout=45)
    return normalize_cv(raw)
