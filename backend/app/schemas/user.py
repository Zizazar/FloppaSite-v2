from typing import List

from pydantic import BaseModel, Field, root_validator

class UserResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    role: str

class UserListResponse(BaseModel):
    users: List[UserResponse]
    totalPages: int
    totalCount: int


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    
    def validate_passwords(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords don't match")
        if self.old_password == self.new_password:
            raise ValueError("New password must be different")