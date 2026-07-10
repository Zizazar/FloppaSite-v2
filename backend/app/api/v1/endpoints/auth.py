from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.limiter import limiter
from app.services.auth_service import create_and_save_token, verify_password
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.user_service import create_user, get_user_by_name

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request,
                credentials: LoginRequest,
                response: Response,
                db: AsyncSession = Depends(get_db)):

    user = await get_user_by_name(db, credentials.username, raise_exception=False)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is banned")

    token = create_and_save_token(user.id, response)
    return {"access_token": token}

@router.post("/register", response_model=TokenResponse)
@limiter.limit("3/minute")
async def register(request: Request,
                   credentials: RegisterRequest,
                   response: Response,
                   db: AsyncSession = Depends(get_db)):

    user = await create_user(db, credentials.username, credentials.password)

    token = create_and_save_token(user.id, response)
    return {"access_token": token}

@router.post("/logout")
def logout(response: Response):

    response.delete_cookie("access_token")
    return {"detail": "Successful logout"}
