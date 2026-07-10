from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_admin_user, get_current_user
from app.models.user import User
from app.schemas.user import (
    ChangePasswordRequest,
    ChangeUsernameRequest,
    UserResponse,
    UserStatusRequest,
)
from app.services import user_service

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    await user_service.change_password(
        db,
        current_user,
        old_password=request.old_password,
        new_password=request.new_password,
        confirm_password=request.confirm_password
    )

    return {"message": "Password changed successfully"}

@router.post("/change-username")
async def change_username(
    request: ChangeUsernameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await user_service.change_username(db, current_user, new_username=request.username)
    return {"message": "Username changed successfully"}

@router.get("/list", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    return await user_service.list_users(db)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    return await user_service.get_user_by_id(db, user_id)

@router.post("/{user_id}/status", response_model=UserResponse)
async def set_user_status(
    user_id: int,
    payload: UserStatusRequest,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    # Админ не может забанить сам себя
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
    user = await user_service.get_user_by_id(db, user_id)
    return await user_service.set_user_status(db, user, payload.is_active)

@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = await user_service.get_user_by_id(db, user_id)
    await user_service.delete_user(db, user)
