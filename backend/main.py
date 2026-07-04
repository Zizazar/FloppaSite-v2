from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.database import init_db, engine
from app.models import *

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\nDB Init")
    try:
        await init_db()
        print("DB initialized")
    except Exception as e:
        print(f"Db init error: {e}")
        raise
    yield
    await engine.dispose()
    print("DB connection closed")

def use_route_names_as_operation_ids(fastapi_app: FastAPI) -> None:
    for route in fastapi_app.routes:
        if isinstance(route, APIRoute):
            route.operation_id = route.name

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")

use_route_names_as_operation_ids(app)

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "FloppaSite Backend is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )
