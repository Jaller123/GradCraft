from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from uuid import uuid4
from app.deps import settings_dep, current_user
from services.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


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
    payload: dict,
    settings=Depends(settings_dep),
    user=Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    token = authorization.split(" ", 1)[1] if authorization else None
    client = get_supabase_client(settings, token)
    # Normalize input
    resume_id = payload.get("id") or str(uuid4())
    data = {
        "id": resume_id,
        "user_id": user["sub"],
        "title": payload.get("title") or "Untitled CV",
        "data": payload.get("data") or {},
        "thumb_data_url": payload.get("thumb_data_url"),
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
