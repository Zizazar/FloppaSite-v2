
import io
import logging
import os
import random
from uuid import UUID
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from PIL import Image

logger = logging.getLogger(__name__)

def get_skin_file_path(user):
    path = os.path.join(settings.UPLOAD_DIR, f"{user.uuid}.png")
    if not os.path.exists(path):
        path = get_fallback_skin(user.uuid)
    logger.debug("Skin path for %s: %s", user.uuid, path)
    return path

def get_skin_file_path_verified(user):
    file_path = get_skin_file_path(user)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Skin not found")
    return file_path

MAX_SKIN_FILE_SIZE = 1024 * 1024  # 1 МБ — скины весят единицы КБ
ALLOWED_SKIN_SIZES = {(64, 64), (64, 32)}  # 64x32 — легаси-формат

async def upload_skin_file(user, file: UploadFile):
    contents = await file.read()
    if len(contents) > MAX_SKIN_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File is too large")

    try:
        image = Image.open(io.BytesIO(contents))
        image.load()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Проверяем реальный формат, а не content_type из запроса
    if image.format != "PNG":
        raise HTTPException(status_code=400, detail="Only PNG files are allowed")

    if image.size not in ALLOWED_SKIN_SIZES:
        raise HTTPException(status_code=400, detail="Skin must be 64x64 or 64x32 pixels")

    # Путь строим напрямую: get_skin_file_path для юзера без скина
    # вернул бы путь к общему дефолтному скину
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{user.uuid}.png")
    with open(file_path, "wb") as f:
        f.write(contents)

def delete_skin_file(user):
    """Удаляет загруженный скин пользователя (общие дефолтные скины не трогает)."""
    path = os.path.join(settings.UPLOAD_DIR, f"{user.uuid}.png")
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            logger.warning("Не удалось удалить скин %s", path, exc_info=True)

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

    random.seed(uuid.bytes)

    filename = random.choice(os.listdir(path))
    return os.path.join(path, filename)
