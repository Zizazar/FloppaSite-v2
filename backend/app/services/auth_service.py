from datetime import datetime, timedelta, timezone
from curl_cffi import AsyncSession
from fastapi import HTTPException, Response
import jwt
from sqlalchemy import select
from app.core.config import settings
from passlib.context import CryptContext

from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def create_and_save_token(user_id: int, response: Response) -> str:
    token = create_access_token(user_id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.JWT_EXPIRATION_MINUTES * 60,
        path="/"
    )
    return token


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def decode_and_get_user(db: AsyncSession, token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token") 
    
    user = await db.scalar(select(User).filter(User.id == user_id))

    return user