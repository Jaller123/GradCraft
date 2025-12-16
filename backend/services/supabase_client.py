from supabase import create_client, Client
from app.config import Settings


def get_supabase_client(settings: Settings, jwt: str | None = None) -> Client:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise ValueError("Supabase URL or anon key not configured")
    client: Client = create_client(settings.supabase_url, settings.supabase_anon_key)
    if jwt:
        # Attach user token so RLS applies to the caller
        client.postgrest.auth(jwt)
    return client
