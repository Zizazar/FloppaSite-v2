import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import jwt
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.database import init_db, engine
from app.core.limiter import limiter
from app.services.auth_service import create_and_save_token, decode_token
from app.models import *

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(levelname)-5s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("DB init")
    try:
        await init_db()
        logger.info("DB initialized")
    except Exception:
        logger.exception("DB init error")
        raise
    yield
    await engine.dispose()
    logger.info("DB connection closed")

def use_route_names_as_operation_ids(fastapi_app: FastAPI) -> None:
    for route in fastapi_app.routes:
        if isinstance(route, APIRoute):
            route.operation_id = route.name

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

# Rate limiting (slowapi)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def sliding_session(request: Request, call_next):
    """Скользящая сессия: активному пользователю продлеваем куку, пока он не
    простаивает дольше JWT_EXPIRATION_MINUTES. Так активные не разлогиниваются
    каждые 30 минут, а неактивные — истекают."""
    response = await call_next(request)

    # auth-эндпоинты сами управляют кукой (login ставит, logout удаляет) — не мешаем
    if request.url.path.startswith("/api/v1/auth/"):
        return response

    token = request.cookies.get("access_token")
    if not token:
        return response

    try:
        payload = decode_token(token)
    except jwt.InvalidTokenError:
        return response

    exp = payload.get("exp")
    user_id = payload.get("user_id")
    if not exp or not user_id:
        return response

    now = datetime.now(timezone.utc).timestamp()
    lifetime = settings.JWT_EXPIRATION_MINUTES * 60
    # Продлеваем, если прошло больше половины срока жизни токена
    if exp - now < lifetime / 2:
        create_and_save_token(user_id, response)

    return response

app.include_router(v1_router, prefix="/api/v1")

use_route_names_as_operation_ids(app)

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "FloppaSite Backend is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )
