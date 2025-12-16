from fastapi import APIRouter, Depends
from app.deps import current_user

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/me")
async def me(user=Depends(current_user)):
    return user
