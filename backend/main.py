import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from db.database import engine, Base
from routers.auth import router as auth_router
from routers.documents import router as documents_router
from routers.sessions import router as sessions_router
from routers.signals import router as signals_router
from routers.analytics import router as analytics_router
from sockets.events import sio
from config import settings

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="ClariClass API",
    description="Real-time adaptive classroom API with struggle signal ingestion & Gemma AI simplification.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(sessions_router)
app.include_router(signals_router)
app.include_router(analytics_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "service": "ClariClass Backend"
    }

# Wrap FastAPI with Socket.IO ASGI application
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host=settings.HOST, port=settings.PORT, reload=True)
