from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import Response
from typing import Optional
import os
import asyncio
import anyio
from uuid import uuid4
from app.deps import settings_dep, current_user
from services.supabase_client import get_supabase_client
from jinja2 import Environment, select_autoescape
from playwright.sync_api import sync_playwright
from models.schemas import ResumeUpsertIn

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

PDF_TEMPLATE = """
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; color: #111; margin: 32px; }
      h1 { margin: 0 0 4px; font-size: 28px; }
      h2 { margin: 18px 0 6px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      .meta { color: #555; font-size: 13px; }
      .row { margin: 2px 0; font-size: 12px; }
      .section { margin-top: 14px; }
      .item { margin: 8px 0; }
      .title { font-weight: 700; }
      .company { color: #333; }
      .dates { color: #666; font-size: 12px; }
      .bullets { margin: 6px 0 0 16px; }
      .skills { font-size: 12px; }
      a { color: #0b5bd3; text-decoration: none; }
    </style>
  </head>
  <body>
    <h1>{{ full_name }}</h1>
    <div class="meta">{{ title }}</div>

    <div class="section">
      <h2>Contact</h2>
      {% if email %}<div class="row">{{ email }}</div>{% endif %}
      {% if phone %}<div class="row">{{ phone }}</div>{% endif %}
      {% if location %}<div class="row">{{ location }}</div>{% endif %}
      {% for link in links %}
      <div class="row"><a href="{{ link }}">{{ link }}</a></div>
      {% endfor %}
    </div>

    {% if summary %}
    <div class="section">
      <h2>Profile</h2>
      <div class="row">{{ summary }}</div>
    </div>
    {% endif %}

    {% if education %}
    <div class="section">
      <h2>Education</h2>
      {% for edu in education %}
      <div class="item">
        <div class="title">{{ edu.school }}</div>
        <div class="dates">{{ edu.start }} - {{ edu.end }}</div>
        <div class="row">{{ edu.program }}</div>
      </div>
      {% endfor %}
    </div>
    {% endif %}

    {% if experience %}
    <div class="section">
      <h2>Experience</h2>
      {% for exp in experience %}
      <div class="item">
        <div class="title">{{ exp.role }}</div>
        <div class="company">{{ exp.company }}</div>
        <div class="dates">{{ exp.start }} - {{ exp.end }}</div>
        {% if exp.bullets %}
        <ul class="bullets">
          {% for b in exp.bullets %}
          <li>{{ b }}</li>
          {% endfor %}
        </ul>
        {% endif %}
      </div>
      {% endfor %}
    </div>
    {% endif %}

    {% if projects %}
    <div class="section">
      <h2>Projects</h2>
      {% for proj in projects %}
      <div class="item">
        <div class="title">{{ proj.name }}</div>
        {% if proj.url %}<div class="row"><a href="{{ proj.url }}">{{ proj.url }}</a></div>{% endif %}
        {% if proj.bullets %}
        <ul class="bullets">
          {% for b in proj.bullets %}
          <li>{{ b }}</li>
          {% endfor %}
        </ul>
        {% endif %}
      </div>
      {% endfor %}
    </div>
    {% endif %}

    {% if skills %}
    <div class="section">
      <h2>Skills</h2>
      <div class="skills">{{ skills|join(", ") }}</div>
    </div>
    {% endif %}
  </body>
</html>
"""

def _safe_filename(name: str) -> str:
    cleaned = "".join(c if c.isalnum() or c in (" ", "-", "_") else "_" for c in (name or "resume"))
    return "_".join(cleaned.split()) or "resume"

def _render_pdf_sync(cv: dict) -> bytes:
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        asyncio.set_event_loop(asyncio.new_event_loop())
    env = Environment(autoescape=select_autoescape(["html", "xml"]))
    tmpl = env.from_string(PDF_TEMPLATE)
    html = tmpl.render(
        full_name=cv.get("fullName") or "Resume",
        title=cv.get("title") or "",
        summary=cv.get("summary") or "",
        email=(cv.get("contacts") or {}).get("email") or "",
        phone=(cv.get("contacts") or {}).get("phone") or "",
        location=(cv.get("contacts") or {}).get("location") or "",
        links=(cv.get("contacts") or {}).get("links") or [],
        education=cv.get("education") or [],
        experience=cv.get("experience") or [],
        projects=cv.get("projects") or [],
        skills=cv.get("skills") or [],
    )
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html, wait_until="load")
        pdf_bytes = page.pdf(format="A4", print_background=True)
        browser.close()
    return pdf_bytes


@router.get("")
def list_resumes(
    settings=Depends(settings_dep),
    user=Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    token = authorization.split(" ", 1)[1] if authorization else None
    client = get_supabase_client(settings, token)
    resp = client.table("resumes").select("*").order("updated_at", desc=True).execute()
    return resp.data


@router.get("/{resume_id}")
def get_resume(
    resume_id: str,
    settings=Depends(settings_dep),
    user=Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    token = authorization.split(" ", 1)[1] if authorization else None
    client = get_supabase_client(settings, token)
    resp = (
        client.table("resumes")
        .select("*")
        .eq("id", resume_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(404, "Not found")
    return resp.data


@router.post("")
def upsert_resume(
    payload: ResumeUpsertIn,
    settings=Depends(settings_dep),
    user=Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    token = authorization.split(" ", 1)[1] if authorization else None
    client = get_supabase_client(settings, token)
    # Normalize input
    resume_id = payload.id or str(uuid4())
    data = {
        "id": resume_id,
        "user_id": user["sub"],
        "title": payload.title or "Untitled CV",
        "data": payload.data or {},
        "thumb_data_url": payload.thumb_data_url,
    }
    # Upsert on id if provided, otherwise insert new
    resp = client.table("resumes").upsert(
        data,
        on_conflict="id",
        returning="representation",  # ensures the saved row is returned
    ).execute()
    # Supabase returns a list; take the first row
    return (resp.data or [None])[0]


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: str,
    settings=Depends(settings_dep),
    user=Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    token = authorization.split(" ", 1)[1] if authorization else None
    client = get_supabase_client(settings, token)
    resp = client.table("resumes").delete().eq("id", resume_id).execute()
    return {"deleted": len(resp.data or [])}


@router.get("/{resume_id}/pdf")
async def download_resume_pdf(
    resume_id: str,
    settings=Depends(settings_dep),
    user=Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    token = authorization.split(" ", 1)[1] if authorization else None
    client = get_supabase_client(settings, token)
    resp = (
        client.table("resumes")
        .select("*")
        .eq("id", resume_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(404, "Not found")
    cv = resp.data.get("data") or {}
    pdf_bytes = await anyio.to_thread.run_sync(_render_pdf_sync, cv)
    filename = _safe_filename(cv.get("fullName") or "resume")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}.pdf"'},
    )
