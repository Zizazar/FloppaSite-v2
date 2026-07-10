from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.admin import ArchiveResponse
from app.services import admin_service

# Публичный просмотр архива серверов (страница /archive)
router = APIRouter(prefix="/archive", tags=["archive"])


@router.get("", response_model=List[ArchiveResponse])
async def list_archives(db: AsyncSession = Depends(get_db)):
    return await admin_service.list_archives(db)


@router.get("/{archive_id}", response_model=ArchiveResponse)
async def get_archive(archive_id: int, db: AsyncSession = Depends(get_db)):
    return await admin_service.get_archive(db, archive_id)
