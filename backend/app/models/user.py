from sqlalchemy import UUID, Boolean, Column, Column, Integer, String

from app.core.database import Base
from uuid import uuid4

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")

    uuid = Column(UUID, unique=True, index=True, default=uuid4)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"