import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str | None = os.getenv("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    groq_url: str = "https://api.groq.com/openai/v1/chat/completions"

    # Supabase (optional; for auth/persistence if you add it later)
    supabase_url: str | None = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
    supabase_anon_key: str | None = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
    supabase_service_role: str | None = os.getenv("SUPABASE_SERVICE_ROLE")
    supabase_audience: str = os.getenv("SUPABASE_AUDIENCE", "authenticated")
    supabase_jwt_secret: str | None = os.getenv("SUPABASE_JWT_SECRET")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
