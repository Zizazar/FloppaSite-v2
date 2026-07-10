import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):

    # Основные параметры
    PROJECT_NAME: str = "FloppaSite Backend"
    PROJECT_DESCRIPTION: str = "Backend API для FloppaSite"
    PROJECT_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    
    # Сервер
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    
    # База данных
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 30

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "C:/Users/user/Desktop/FloppaSite-v2/backend/uploads")
    
    class Config:
        case_sensitive = True

settings = Settings()

if not settings.DEBUG and settings.JWT_SECRET_KEY == "your-secret-key-change-me-in-production":
    raise RuntimeError(
        "JWT_SECRET_KEY не задан: в продакшене (DEBUG=False) укажите его в .env"
    )
