# apps/api/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from api.routes.ingestion.router import router as ingestion_router
from api.routes.chat import router as chat_router

# Fast API app initialization
app = FastAPI()

# Include the ingestion router
app.include_router(ingestion_router)

# Include the chat router
app.include_router(chat_router)


# Serve the frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")