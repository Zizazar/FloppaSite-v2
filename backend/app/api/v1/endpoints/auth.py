from typing_extensions import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.auth_service import create_access_token, create_and_save_token, get_password_hash, verify_password
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.models.user import User
from app.services.user_service import create_user, get_user_by_name
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, 
                response: Response, 
                db: AsyncSession = Depends(get_db)):
    
    user = await get_user_by_name(db, request.username)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_and_save_token(user.id, response)
    return {"access_token": token}

@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, 
                   response: Response,
                   db: AsyncSession = Depends(get_db)):
    
    user = await create_user(db, request.username, request.password)

    token = create_and_save_token(user.id, response)
    return {"access_token": token}

@router.post("/logout")
def logout(response: Response):

    response.delete_cookie("access_token")
    return {"detail": "Successful logout"}