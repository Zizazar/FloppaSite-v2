from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.services.auth_service import get_password_hash, verify_password

async def get_user_by_name(db: AsyncSession, username: str, raise_exception: bool = True):
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalars().first()
    if not user and raise_exception:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_user_by_uuid(db: AsyncSession, uuid: str, raise_exception: bool = True):
    result = await db.execute(select(User).filter(User.uuid == uuid))
    user = result.scalars().first()
    if not user and raise_exception:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def change_password(db: AsyncSession, user: User, old_password: str, new_password: str, confirm_password: str):

    if not verify_password(old_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid old password")
    
    if old_password == new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password"
        )
    
    if new_password != confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords don't match"
        )
    
    user.hashed_password = get_password_hash(new_password)
    
    db.add(user)
    await db.commit()

async def change_username(db: AsyncSession, user: User, new_username: str):
    user.username = new_username
    db.add(user)
    await db.commit()

async def delete_user(db: AsyncSession, user: User):
    await db.delete(user)
    await db.commit()

async def list_users(db: AsyncSession):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

async def create_user(db: AsyncSession, username: str, password: str):
    user = await get_user_by_name(db, username, raise_exception=False)
    if user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = get_password_hash(password)
    user = User(username=username, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user