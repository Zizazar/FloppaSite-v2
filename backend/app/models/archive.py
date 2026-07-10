from sqlalchemy import JSON, Column, Integer, String, Text

from app.core.database import Base


class ArchiveServer(Base):
    """Архивная сборка/сезон сервера.

    Публично отображается на /archive, управляется из админки (ArchiveTab).
    """
    __tablename__ = "archive_servers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), default="", nullable=False)
    version = Column(String(64), default="", nullable=False)
    mod_loader = Column(String(64), default="Fabric", nullable=False)
    description = Column(Text, default="", nullable=False)
    # Файлы для скачивания: [{id, name, type, size, url}, ...]
    files = Column(JSON, default=list, nullable=False)
    # Ссылки на скриншоты
    screenshots = Column(JSON, default=list, nullable=False)
