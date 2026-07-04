
import io
import os
import random
from uuid import UUID
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

def get_skin_file_path(user):
    path = os.path.join(settings.UPLOAD_DIR, f"{user.uuid}.png")
    if not os.path.exists(path):
        path = get_fallback_skin(user.uuid)
    print(path)
    return path

def get_skin_file_path_verified(user):
    file_path = get_skin_file_path(user)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Skin not found")
    return file_path

async def upload_skin_file(user, file_content):
    try:
        image = Image.open(file_content)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    if image.size != (64, 64):
        raise HTTPException(status_code=400, detail="Skin must be 64x64 pixels")

    file_path = get_skin_file_path(user)
    async with open(file_path, "wb") as f:
        await f.write(file_content.read())

def get_avatar_from_skin(user):
    file_path = get_skin_file_path(user)

    image = Image.open(file_path).convert("RGBA")
    image = image.crop((8, 8, 16, 16)) # head region

    imgio = io.BytesIO()
    image.save(imgio, 'PNG')
    imgio.seek(0)

    return imgio

def get_fallback_skin(uuid: UUID):
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(current_dir, "static", "default_skins")

    print(type(uuid), uuid)
    random.seed(uuid.bytes)

    filename = random.choice(os.listdir(path))
    return os.path.join(path, filename)

