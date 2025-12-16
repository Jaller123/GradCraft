from fastapi import Depends
from functools import lru_cache
from app.config import Settings
from fastapi import Header, HTTPException
from app.auth.supabase import verify_supabase_token


@lru_cache
def get_settings() -> Settings:
    return Settings()


def settings_dep(settings: Settings = Depends(get_settings)) -> Settings:
    return settings


async def current_user(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(settings_dep),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    claims = await verify_supabase_token(token, settings)
    return {
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "app_metadata": claims.get("app_metadata", {}),
        "user_metadata": claims.get("user_metadata", {}),
    }
