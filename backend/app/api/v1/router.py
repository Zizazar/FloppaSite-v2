from fastapi import APIRouter

from app.api.v1.endpoints import admin
from app.api.v1.endpoints import archive
from app.api.v1.endpoints import skin
from app.api.v1.endpoints import user
from app.api.v1.endpoints import auth

router = APIRouter()

router.include_router(user.router)
router.include_router(auth.router)
router.include_router(skin.router)
router.include_router(admin.router)
router.include_router(archive.router)
