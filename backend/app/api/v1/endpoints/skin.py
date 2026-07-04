from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.user import User
from app.services.skin_service import get_avatar_from_skin, get_skin_file_path, upload_skin_file
from app.services.user_service import get_user_by_name, get_user_by_uuid

router = APIRouter(prefix="/skin", tags=["skin"])

async def get_user_or_current(
    uuid: Optional[str],
    name: Optional[str],
    current_user: Optional[User],
    db: AsyncSession,
) -> User:
    if uuid:
        user = await get_user_by_uuid(db, uuid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    if name:
        user = await get_user_by_name(db, name)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    if current_user:
        return current_user
    
    raise HTTPException(status_code=401, detail="Not Authorized")

@router.get("/")
async def get_skin_by_name(
    name: Optional[str] = None,
    uuid: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_or_current(uuid, name, current_user, db)
    file_path = get_skin_file_path(user)
    return FileResponse(file_path, media_type="image/png")

@router.get("/avatar")
async def get_user_avatar(
    name: Optional[str] = None,
    uuid: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_or_current(uuid, name, current_user, db)
    avatar = get_avatar_from_skin(user)
    return StreamingResponse(content=avatar, media_type="image/png")

@router.post("/upload")
async def upload_skin(
    current_user: Optional[User] = Depends(get_current_user),
    file: UploadFile = File(...),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    
    if file.content_type != "image/png":
        raise HTTPException(status_code=400, detail="Only PNG files are allowed")
    
    await upload_skin_file(current_user, file)
    return {"message": "Skin uploaded successfully"}

