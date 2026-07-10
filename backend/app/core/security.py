from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.core.database import get_db
from app.services.auth_service import decode_and_get_user

async def get_current_user(
        request: Request,
        db: AsyncSession = Depends(get_db)):

    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not Authorized")

    user = await decode_and_get_user(db, token)

    return user

async def get_current_user_optional(
        request: Request,
        db: AsyncSession = Depends(get_db)):

    token = request.cookies.get("access_token")
    if not token:
        return None

    # Просроченный/битый токен не должен ломать публичные эндпоинты
    try:
        return await decode_and_get_user(db, token)
    except HTTPException:
        return None

async def get_admin_user(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
