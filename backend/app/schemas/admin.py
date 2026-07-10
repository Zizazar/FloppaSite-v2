from typing import List

from pydantic import BaseModel, ConfigDict, Field

# Имена полей намеренно в camelCase — так их ждёт фронтенд (ServerTab, ArchiveTab,
# DashboardTab, ServerInfo). Схемы напрямую формируют контракт сгенерированного клиента.


class ModEntry(BaseModel):
    """Один мод из репозитория packwiz (одна запись на платформу/сторону).

    Формат приходит извне (packwiz export), поэтому допускаем лишние поля.
    """
    model_config = ConfigDict(extra="allow")

    name: str = ""
    version: str = ""
    filename: str = ""
    download_url: str = ""
    page_url: str = ""
    platform: str = ""
    side: str = ""


class ServerConfigSchema(BaseModel):
    ip: str = ""
    name: str = ""
    description: str = ""
    version: str = ""
    launchDate: str = ""
    modLoader: str = "Fabric"
    # URL репозитория packwiz, из которого тянется список модов (см. GET /admin/mods)
    modsRepoUrl: str = ""
    # filename закреплённых модов — показываются крупными плитками в начале списка
    pinnedMods: List[str] = Field(default_factory=list)


class PlayerSample(BaseModel):
    """Игрок из sample-списка ответа Server List Ping."""
    name: str = ""
    uuid: str = ""


class ServerStatusResponse(BaseModel):
    """Живой статус майнкрафт-сервера (реальный пинг по config.ip)."""
    online: bool = False
    playersOnline: int = 0
    playersMax: int = 0
    latencyMs: int = 0
    version: str = ""
    # Ники/uuid игроков онлайн (sample из ping-ответа; сервер отдаёт подмножество)
    players: List[PlayerSample] = Field(default_factory=list)


class StatsResponse(BaseModel):
    onlinePlayers: int = 0
    websiteUsersNow: int = 0
    launcherDownloads: int = 0
    websiteUsersDaily: int = 0
    websiteUsersMonthly: int = 0
    totalRegistered: int = 0


class ArchiveFileSchema(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int = 0
    name: str = ""
    type: str = "modpack"
    size: str = ""
    url: str = ""


class ArchiveBase(BaseModel):
    name: str = ""
    version: str = ""
    modLoader: str = "Fabric"
    description: str = ""
    files: List[ArchiveFileSchema] = Field(default_factory=list)
    screenshots: List[str] = Field(default_factory=list)


class ArchiveCreate(ArchiveBase):
    pass


class ArchiveResponse(ArchiveBase):
    id: int
