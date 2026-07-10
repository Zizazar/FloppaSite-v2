from sqlalchemy import UUID, Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base
from uuid import uuid4

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(16), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(String(20), default="user", nullable=False)

    uuid = Column(UUID, unique=True, index=True, default=uuid4, nullable=False)

    # Момент регистрации — отображается в админке (UsersTab)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
