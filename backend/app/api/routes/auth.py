from fastapi import APIRouter, Depends, HTTPException
import requests
from app.deps import current_user, settings_dep
from services.supabase_client import get_supabase_admin_client

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/me")
async def me(user=Depends(current_user)):
    return user


@router.delete("/account")
async def delete_account(user=Depends(current_user), settings=Depends(settings_dep)):
    if not settings.supabase_url or not settings.supabase_service_role:
        raise HTTPException(500, "Supabase service role not configured")
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(400, "Missing user id")

    client = get_supabase_admin_client(settings)
    client.table("resumes").delete().eq("user_id", user_id).execute()
    client.table("job_posts").delete().eq("owner_id", user_id).execute()
    client.table("profiles").delete().eq("user_id", user_id).execute()

    url = f"{settings.supabase_url}/auth/v1/admin/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role}",
        "apikey": settings.supabase_service_role,
        "Content-Type": "application/json",
    }
    resp = requests.delete(url, headers=headers, timeout=20)
    if not resp.ok:
        raise HTTPException(resp.status_code, resp.text)
    return {"deleted": True}
