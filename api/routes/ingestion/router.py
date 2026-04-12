from fastapi import APIRouter
from api.routes.ingestion.resume import router as resume_router

router = APIRouter(
    prefix="/ingestion",
    tags=["Ingestion"]
)

router.include_router(resume_router)