from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_admin_user, get_current_user
from app.models.user import User
from app.schemas.user import ChangePasswordRequest, UserResponse

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/me", response_model=UserResponse)
async def get_user_profile(current_user = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    
    await current_user.change_password(
        db,
        old_password=request.old_password,
        new_password=request.new_password,
        confirm_password=request.confirm_password
    )
    
    return {"message": "Password changed successfully"}

@router.post("/change-username")
async def change_username(
    username: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await current_user.change_username(db, new_username=username)
    return {"message": "Username changed successfully"}

@router.get("/list", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    users = await db.query(User).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    user = await db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    user = await db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return HTTPException(status_code=204, detail="User deleted")
