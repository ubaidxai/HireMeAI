# apps/api/main.py
from fastapi import FastAPI
from apps.api.routes.chat import router

app = FastAPI()
app.include_router(router)