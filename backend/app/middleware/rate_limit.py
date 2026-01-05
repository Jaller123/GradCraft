import os
import time
from collections import deque
from typing import Deque, Dict

from fastapi import Request
from fastapi.responses import JSONResponse

# Simple in-memory limiter: per-IP rolling window.
_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "120"))
_STORE: Dict[str, Deque[float]] = {}


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def rate_limit_middleware(request: Request, call_next):
    if not request.url.path.startswith("/api"):
        return await call_next(request)

    now = time.time()
    key = _client_key(request)
    bucket = _STORE.get(key)
    if bucket is None:
        bucket = deque()
        _STORE[key] = bucket

    cutoff = now - _WINDOW_SECONDS
    while bucket and bucket[0] < cutoff:
        bucket.popleft()

    if len(bucket) >= _MAX_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please slow down and try again."},
        )

    bucket.append(now)
    return await call_next(request)
