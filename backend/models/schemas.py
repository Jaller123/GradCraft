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
    "additionalProperties": False,
    "properties": {
        "fullName": {"type": "string"},
        "title": {"type": "string"},
        "summary": {"type": "string"},
        "contacts": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "location": {"type": "string"},
                "links": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["email", "phone", "location", "links"],
        },
        "skills": {"type": "array", "items": {"type": "string"}},
        "experience": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "role": {"type": "string"},
                    "company": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"},
                    "bullets": {"type": "array", "items": {"type": "string"}},
                    "tech": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["role", "company", "start", "end", "bullets", "tech"],
            },
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "school": {"type": "string"},
                    "program": {"type": "string"},
                    "start": {"type": "string"},
                    "end": {"type": "string"},
                },
                "required": ["school", "program", "start", "end"],
            },
        },
        "projects": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "name": {"type": "string"},
                    "url": {"type": "string"},
                    "bullets": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["name", "url", "bullets"],
            },
        },
        "languages": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
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
