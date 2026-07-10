import re
import time

import httpx
from fastapi import HTTPException
from mcstatus import JavaServer
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.archive import ArchiveServer
from app.models.server_config import ServerConfig
from app.models.user import User
from app.schemas.admin import (
    ArchiveCreate,
    ArchiveResponse,
    ModEntry,
    PlayerSample,
    ServerConfigSchema,
    ServerStatusResponse,
    StatsResponse,
)

# ---------------------------------------------------------------------------
# Конфигурация сервера (синглтон)
# ---------------------------------------------------------------------------

async def get_or_create_server_config(db: AsyncSession) -> ServerConfig:
    config = await db.scalar(select(ServerConfig).order_by(ServerConfig.id).limit(1))
    if config is None:
        config = ServerConfig()
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config


def _config_to_schema(config: ServerConfig) -> ServerConfigSchema:
    return ServerConfigSchema(
        ip=config.ip,
        name=config.name,
        description=config.description,
        version=config.version,
        launchDate=config.launch_date,
        modLoader=config.mod_loader,
        modsRepoUrl=config.mods_repo_url or "",
        pinnedMods=list(config.pinned_mods or []),
    )


async def get_server_config(db: AsyncSession) -> ServerConfigSchema:
    config = await get_or_create_server_config(db)
    return _config_to_schema(config)


async def update_server_config(db: AsyncSession, data: ServerConfigSchema) -> ServerConfigSchema:
    config = await get_or_create_server_config(db)
    config.ip = data.ip
    config.name = data.name
    config.description = data.description
    config.version = data.version
    config.launch_date = data.launchDate
    config.mod_loader = data.modLoader
    config.mods_repo_url = data.modsRepoUrl
    config.pinned_mods = list(data.pinnedMods or [])
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return _config_to_schema(config)


async def get_mods(db: AsyncSession) -> list[ModEntry]:
    """Тянет список модов из репозитория packwiz (config.mods_repo_url).

    Проксируем на бэкенде, чтобы обойти CORS и не светить URL репозитория в браузере.
    Ожидаем JSON-массив объектов формата packwiz export (см. ModEntry).
    """
    config = await get_or_create_server_config(db)
    url = (config.mods_repo_url or "").strip()
    if not url:
        return []

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as http:
            resp = await http.get(url)
            resp.raise_for_status()
            data = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"Не удалось загрузить репозиторий модов: {exc}")

    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Репозиторий модов вернул не массив")

    return [ModEntry(**item) for item in data if isinstance(item, dict)]


# ---------------------------------------------------------------------------
# Живой статус сервера (реальный пинг)
# ---------------------------------------------------------------------------

# Кэшируем результат пинга на несколько секунд, чтобы не пинговать сервер на
# каждый запрос (лендинг опрашивает статус раз в 10с, посетителей может быть много).
_STATUS_TTL = 5.0
_status_cache: dict[str, tuple[float, ServerStatusResponse]] = {}

# §-коды форматирования Minecraft и «пустой» UUID рекламных строк в sample.
_SECTION_CODE = re.compile(r"§.")
_EMPTY_UUID = "00000000-0000-0000-0000-000000000000"


def _parse_sample(sample) -> list[PlayerSample]:
    """Чистим sample из ping-ответа: убираем §-коды и рекламные строки (нулевой uuid)."""
    players: list[PlayerSample] = []
    for p in sample or []:
        uuid = str(p.id)
        if uuid == _EMPTY_UUID:
            continue  # это не игрок, а рекламная строка сервера
        name = _SECTION_CODE.sub("", p.name).strip()
        if name:
            players.append(PlayerSample(name=name, uuid=uuid))
    return players


async def get_server_status(db: AsyncSession) -> ServerStatusResponse:
    """Реальный Server List Ping по config.ip: онлайн, число игроков, sample-ники."""
    config = await get_or_create_server_config(db)
    address = (config.ip or "").strip()
    if not address:
        return ServerStatusResponse(online=False)

    cached = _status_cache.get(address)
    if cached and (time.monotonic() - cached[0]) < _STATUS_TTL:
        return cached[1]

    try:
        server = await JavaServer.async_lookup(address)
        status = await server.async_status()
        players = _parse_sample(status.players.sample)
        result = ServerStatusResponse(
            online=True,
            playersOnline=status.players.online,
            playersMax=status.players.max,
            latencyMs=round(status.latency),
            version=status.version.name,
            players=players,
        )
    except Exception:
        # Сервер недоступен / не отвечает на ping — считаем оффлайн.
        result = ServerStatusResponse(online=False)

    _status_cache[address] = (time.monotonic(), result)
    return result


# ---------------------------------------------------------------------------
# Статистика
# ---------------------------------------------------------------------------

async def get_stats(db: AsyncSession) -> StatsResponse:
    total_registered = await db.scalar(select(func.count()).select_from(User)) or 0

    # onlinePlayers / websiteUsers* требуют внешних интеграций (query майнкрафт-сервера,
    # аналитика посещений) — пока отдаём реальное число регистраций и нули-заглушки.
    return StatsResponse(
        totalRegistered=total_registered,
    )


# ---------------------------------------------------------------------------
# Архивы
# ---------------------------------------------------------------------------

def _archive_to_schema(archive: ArchiveServer) -> ArchiveResponse:
    return ArchiveResponse(
        id=archive.id,
        name=archive.name,
        version=archive.version,
        modLoader=archive.mod_loader,
        description=archive.description,
        files=archive.files or [],
        screenshots=archive.screenshots or [],
    )


async def list_archives(db: AsyncSession) -> list[ArchiveResponse]:
    result = await db.execute(select(ArchiveServer).order_by(ArchiveServer.id.desc()))
    return [_archive_to_schema(a) for a in result.scalars().all()]


async def get_archive(db: AsyncSession, archive_id: int) -> ArchiveResponse:
    archive = await db.get(ArchiveServer, archive_id)
    if archive is None:
        raise HTTPException(status_code=404, detail="Archive not found")
    return _archive_to_schema(archive)


async def create_archive(db: AsyncSession, data: ArchiveCreate) -> ArchiveResponse:
    archive = ArchiveServer(
        name=data.name,
        version=data.version,
        mod_loader=data.modLoader,
        description=data.description,
        files=[f.model_dump() for f in data.files],
        screenshots=list(data.screenshots),
    )
    db.add(archive)
    await db.commit()
    await db.refresh(archive)
    return _archive_to_schema(archive)


async def update_archive(db: AsyncSession, archive_id: int, data: ArchiveCreate) -> ArchiveResponse:
    archive = await db.get(ArchiveServer, archive_id)
    if archive is None:
        raise HTTPException(status_code=404, detail="Archive not found")
    archive.name = data.name
    archive.version = data.version
    archive.mod_loader = data.modLoader
    archive.description = data.description
    archive.files = [f.model_dump() for f in data.files]
    archive.screenshots = list(data.screenshots)
    db.add(archive)
    await db.commit()
    await db.refresh(archive)
    return _archive_to_schema(archive)


async def delete_archive(db: AsyncSession, archive_id: int) -> None:
    archive = await db.get(ArchiveServer, archive_id)
    if archive is None:
        raise HTTPException(status_code=404, detail="Archive not found")
    await db.delete(archive)
    await db.commit()
