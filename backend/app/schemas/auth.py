from pydantic import BaseModel, Field

# Ники в формате Minecraft: 3-16 символов, латиница/цифры/подчёркивание
USERNAME_PATTERN = r"^[a-zA-Z0-9_]+$"

class LoginRequest(BaseModel):
    username: str = Field(..., max_length=64)
    password: str = Field(..., max_length=128)

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=16, pattern=USERNAME_PATTERN)
    password: str = Field(..., min_length=8, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
