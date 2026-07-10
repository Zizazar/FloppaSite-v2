from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_admin_user
from app.models.user import User
from app.schemas.admin import (
    ArchiveCreate,
    ArchiveResponse,
    ModEntry,
    ServerConfigSchema,
    ServerStatusResponse,
    StatsResponse,
)
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Публичные (данные показываются на лендинге) ---------------------------

@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    return await admin_service.get_stats(db)


@router.get("/server", response_model=ServerConfigSchema)
async def get_server_config(db: AsyncSession = Depends(get_db)):
    return await admin_service.get_server_config(db)


@router.get("/mods", response_model=List[ModEntry])
async def get_mods(db: AsyncSession = Depends(get_db)):
    """Список модов из репозитория packwiz (см. ServerConfig.mods_repo_url)."""
    return await admin_service.get_mods(db)


@router.get("/status", response_model=ServerStatusResponse)
async def get_server_status(db: AsyncSession = Depends(get_db)):
    """Живой статус майнкрафт-сервера — реальный пинг по config.ip."""
    return await admin_service.get_server_status(db)


# --- Только для админа -----------------------------------------------------

@router.put("/server", response_model=ServerConfigSchema)
async def update_server_config(
    data: ServerConfigSchema,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_server_config(db, data)


@router.post("/archive", response_model=ArchiveResponse, status_code=201)
async def create_archive(
    data: ArchiveCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.create_archive(db, data)


@router.put("/archive/{archive_id}", response_model=ArchiveResponse)
async def update_archive(
    archive_id: int,
    data: ArchiveCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.update_archive(db, archive_id, data)


@router.delete("/archive/{archive_id}", status_code=204)
async def delete_archive(
    archive_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    await admin_service.delete_archive(db, archive_id)
