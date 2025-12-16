from pydantic import BaseModel, Field
from typing import Optional, Any, Dict


class PromptIn(BaseModel):
    prompt: str


class SeedIn(BaseModel):
    name: str
    title: Optional[str] = ""
    bio: str = Field(default_factory=str)


class ExtractIn(BaseModel):
    free_text: str


class ImproveIn(BaseModel):
    current_cv: Dict[str, Any]
    job_text: Optional[str] = ""


CV_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "fullName": {"type": "string"},
        "title": {"type": "string"},
        "summary": {"type": "string"},
        "contacts": {
            "type": "object",
            "properties": {
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "location": {"type": "string"},
                "links": {"type": "array", "items": {"type": "string"}},
            },
        },
        "skills": {"type": "array", "items": {"type": "string"}},
        "experience": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "role": {"type": "string"},
                    "company": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"},
                    "bullets": {"type": "array", "items": {"type": "string"}},
                    "tech": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["role", "company", "bullets", "tech"],
            },
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "school": {"type": "string"},
                    "program": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"},
                },
                "required": ["school", "program"],
            },
        },
        "projects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "url": {"type": "string"},
                    "bullets": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["name", "bullets"],
            },
        },
        "languages": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"name": {"type": "string"}, "level": {"type": "string"}},
                "required": ["name", "level"],
            },
        },
    },
    "required": [
        "fullName",
        "title",
        "summary",
        "contacts",
        "skills",
        "experience",
        "education",
        "projects",
        "languages",
    ],
}
