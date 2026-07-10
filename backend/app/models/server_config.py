from sqlalchemy import JSON, Column, Integer, String, Text

from app.core.database import Base


class ServerConfig(Base):
    """Конфигурация сервера (синглтон, всегда одна строка с id=1).

    Отображается на лендинге (ServerInfo) и редактируется в админке (ServerTab).
    """
    __tablename__ = "server_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ip = Column(String(255), default="", nullable=False)
    name = Column(String(255), default="", nullable=False)
    description = Column(Text, default="", nullable=False)
    version = Column(String(64), default="", nullable=False)
    # Дата последнего вайпа в формате YYYY-MM-DD
    launch_date = Column(String(32), default="", nullable=False)
    mod_loader = Column(String(64), default="Fabric", nullable=False)
    # URL репозитория packwiz — отдаёт JSON-массив модов, который показываем на лендинге
    mods_repo_url = Column(String(1024), default="", nullable=False)
    # Закреплённые моды: список filename (ключ группировки), выбираются в админке.
    # Показываются крупными плитками в начале списка на лендинге.
    pinned_mods = Column(JSON, default=list, nullable=False)
