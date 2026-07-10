from app.core.database import Base

__all__ = ["Base"]
# Импорт всех моделей, чтобы они регистрировались в Base.metadata
from app.models.user import User
from app.models.server_config import ServerConfig
from app.models.archive import ArchiveServer
