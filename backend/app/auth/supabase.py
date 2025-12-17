import time
import logging
import httpx
from jose import jwt
from fastapi import HTTPException
from typing import Dict, Any

from app.config import Settings

_jwks_cache: Dict[str, Any] = {"keys": None, "ts": 0}
logger = logging.getLogger(__name__)


async def get_jwks(settings: Settings):
    now = time.time()
    if _jwks_cache["keys"] and now - _jwks_cache["ts"] < 3600:
        return _jwks_cache["keys"]

    if not settings.supabase_url:
        raise HTTPException(500, "SUPABASE_URL not set")
    if not settings.supabase_anon_key:
        raise HTTPException(500, "SUPABASE_ANON_KEY not set")

    # Supabase exposes JWKS at /auth/v1/keys (legacy) or /.well-known/jwks.json (fallback)
    primary_url = f"{settings.supabase_url}/auth/v1/keys"
    fallback_url = f"{settings.supabase_url}/.well-known/jwks.json"

    async with httpx.AsyncClient() as client:
        # Try primary endpoint first
        resp = await client.get(
            primary_url,
            headers={"apikey": settings.supabase_anon_key},
            timeout=10,
        )
        if resp.status_code == 404:
            resp = await client.get(fallback_url, timeout=10)

        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "JWKS fetch failed: %s %s (url=%s)",
                exc.response.status_code,
                exc.response.reason_phrase,
                exc.request.url,
            )
            raise HTTPException(
                503,
                f"Failed to fetch JWKS ({exc.response.status_code} {exc.response.reason_phrase}); "
                "check SUPABASE_URL/SUPABASE_ANON_KEY",
            )

        data = resp.json()
        keys = data.get("keys") or data  # fallback shape if jwks.json returns the array root
        if not keys:
            raise HTTPException(503, "JWKS response empty")

        _jwks_cache["keys"] = keys
        _jwks_cache["ts"] = now
        return _jwks_cache["keys"]


async def verify_supabase_token(token: str, settings: Settings) -> Dict[str, Any]:
    last_error: Exception | None = None

    # Try RS256 (hosted JWKS)
    try:
        jwks = await get_jwks(settings)
        return jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.supabase_audience,
        )
    except HTTPException as exc:
        # If JWKS cannot be fetched (e.g., 404), fall back to HS256 if secret is set
        if exc.status_code != 503:
            raise
        last_error = exc
    except Exception as exc:  # pragma: no cover - defensive
        last_error = exc

    # Fallback: HS256 using Supabase JWT secret (many projects default to HS256)
    if settings.supabase_jwt_secret:
        try:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience=settings.supabase_audience,
            )
        except Exception as exc:  # pragma: no cover - defensive
            last_error = exc

    logger.warning("Supabase token verification failed: %s", last_error)
    raise HTTPException(401, f"Invalid token: {last_error or 'verification failed'}")
