# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FloppaSite (FloppaLand) is a Minecraft server community site with user accounts and skin upload/serving. Two independent apps:

- `backend/` — FastAPI + SQLAlchemy (async) + SQLite (aiosqlite; Postgres drivers also installed). Runs on port 8000.
- `frontend/` — Next.js 15 (App Router) + React 19 + Tailwind 4 + TanStack Query. Dev server on port 3000.

## Commands

### Backend (run from `backend/`)

```bash
pip install -r requirements.txt
python main.py            # starts uvicorn with reload (DEBUG=True by default)
```

Swagger UI at `http://localhost:8000/docs`. There are no backend tests. Alembic is configured but has no migrations — tables are created at startup via `init_db()` (`Base.metadata.create_all`) in the FastAPI lifespan, so model changes take effect on restart against `test.db`.

### Frontend (run from `frontend/`)

```bash
npm run dev       # Next dev server
npm run build     # production build (ESLint skipped, TS errors fail the build)
npm run lint      # eslint .
npm run openapi   # regenerate client/ from the running backend — backend must be up on :8000
```

### Docker

`docker-compose up` at repo root runs frontend (host port 8000) and backend (host port 8001). Note the ports differ from local dev.

## Architecture

### API contract: generated client

The frontend never calls the backend with raw fetch. `npm run openapi` (`@hey-api/openapi-ts`, config in `frontend/openapi-ts.config.ts`) reads `http://localhost:8000/openapi.json` and regenerates `frontend/client/` (SDK functions, types, TanStack Query helpers). Never hand-edit `frontend/client/` — after changing backend endpoints/schemas, restart the backend and regenerate.

The backend sets `route.operation_id = route.name` in `main.py`, so FastAPI **function names become the generated SDK function names** (e.g. `get_user_profile` → `getUserProfile`). Renaming a backend endpoint function is a breaking change for the frontend.

### Backend layering

`app/api/v1/endpoints/` (auth, user, skin) → `app/services/` (business logic) → `app/models/` (SQLAlchemy). Pydantic schemas in `app/schemas/`. New routers are registered in `app/api/v1/router.py`; the versioned router mounts at `/api/v1` in `main.py`.

Config is `app/core/config.py` (`settings`), a pydantic-settings class reading `.env` — DATABASE_URL, JWT_SECRET_KEY, UPLOAD_DIR (defaults to an absolute local path), SERVER_HOST/PORT.

### Auth flow

JWT stored in an **HttpOnly `access_token` cookie**, not an Authorization header. Backend dependencies in `app/core/security.py`: `get_current_user`, `get_current_user_optional`, `get_admin_user` (checks `User.role == "admin"`) all read the cookie from the request. Login/register set the cookie via `create_and_save_token` in `auth_service.py`.

On the frontend:
- Client-side calls use `lib/api-client.ts` (`credentials: 'include'`).
- Server components must call `setupServerApiClient()` from `lib/api-server.ts`, which forwards the incoming cookies to the backend via a request interceptor.
- `middleware.ts` redirects `/dashboard` routes to `/login` when the cookie is absent.
- `next.config.ts` rewrites `/api/*` to the backend (`lib/config.ts` → `NEXT_PUBLIC_API_URL`, default `http://localhost:8000`), so browser requests stay same-origin and the cookie flows.

### Skins

`skin.py` endpoints serve skin PNGs and cropped avatars by name/uuid/current user. Uploaded skins go to `settings.UPLOAD_DIR`; fallback default skins live in `backend/app/static/default_skins/`. `get_user_or_current` in `skin.py` is the shared resolution helper (uuid → name → authenticated user).

### Frontend structure

- `app/` — routes: landing (`page.tsx`), `login`, `register`, `profile`, `admin`, `archive`.
- `hooks/use-api.ts` — typed TanStack Query hooks wrapping the generated SDK, with a query-key factory (`apiKeys`). Add new API hooks here rather than calling the SDK directly in components.
- `components/8starlabs-ui/` — local UI component library (shadcn-style).
- `lib/config.ts` — `CONFIG` object: API base URLs, launcher download links, Discord server id.

Comments and docs are partly in Russian; keep that convention where files already use it.
