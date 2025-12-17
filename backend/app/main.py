import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from app.api.routes import ai, auth, resumes, health

load_dotenv(dotenv_path=find_dotenv(), override=False)


def create_app() -> FastAPI:
    app = FastAPI()

    # Allow configurable CORS origins (comma-separated env var)
    raw_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://localhost:3000")
    allow_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_origin_regex=r"https?://localhost(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(ai.router)
    app.include_router(auth.router)
    app.include_router(health.router)
    app.include_router(resumes.router)
    return app


app = create_app()
