import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from app.api.routes import ai, auth, resumes

load_dotenv(dotenv_path=find_dotenv(), override=False)


def create_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(ai.router)
    app.include_router(auth.router)
    app.include_router(resumes.router)
    return app


app = create_app()
