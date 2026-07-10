from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.auth import USERNAME_PATTERN

class UserResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    role: str
    created_at: Optional[datetime] = None

class UserListResponse(BaseModel):
    users: List[UserResponse]
    totalPages: int
    totalCount: int


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

class ChangeUsernameRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=16, pattern=USERNAME_PATTERN)

class UserStatusRequest(BaseModel):
    is_active: bool
