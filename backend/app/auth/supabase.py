import time
import httpx
from jose import jwt
from fastapi import HTTPException
from typing import Dict, Any

from app.config import Settings

_jwks_cache: Dict[str, Any] = {"keys": None, "ts": 0}


async def get_jwks(settings: Settings):
    now = time.time()
    if _jwks_cache["keys"] and now - _jwks_cache["ts"] < 3600:
        return _jwks_cache["keys"]

    if not settings.supabase_url:
        raise HTTPException(500, "SUPABASE_URL not set")

    jwks_url = f"{settings.supabase_url}/auth/v1/jwks"
    async with httpx.AsyncClient() as client:
        r = await client.get(jwks_url, timeout=10)
        r.raise_for_status()
        data = r.json()
        _jwks_cache["keys"] = data["keys"]
        _jwks_cache["ts"] = now
        return _jwks_cache["keys"]


async def verify_supabase_token(token: str, settings: Settings) -> Dict[str, Any]:
    jwks = await get_jwks(settings)
    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.supabase_audience,
        )
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")
    return payload
