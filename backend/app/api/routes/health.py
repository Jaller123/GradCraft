from fastapi import APIRouter, Depends
from app.deps import settings_dep
from app.auth.supabase import get_jwks

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health(settings=Depends(settings_dep)):
    status = {
        "supabase_url": bool(settings.supabase_url),
        "supabase_anon_key": bool(settings.supabase_anon_key),
        "supabase_jwt_secret": bool(settings.supabase_jwt_secret),
    }

    try:
        jwks = await get_jwks(settings)
        status["jwks"] = {"ok": True, "keys": len(jwks or [])}
    except Exception as exc:
        status["jwks"] = {"ok": False, "error": str(exc)}

    return status
