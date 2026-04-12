from fastapi import APIRouter, UploadFile, File
from api.schemas.ingestion import IngestionResponse
from src.ingestion.services.resume_ingestion import run_ingestion

router = APIRouter()

@router.post("/resume", response_model=IngestionResponse)
def ingest_resume(file: UploadFile = File(...)):
    run_ingestion(file.file)

    return IngestionResponse(
        status="success",
        message=f"File '{file.filename}' ingested successfully.",
        source=file.filename,
        # chunks_created=5,
        # chunk_ids=["chunk1", "chunk2", "chunk3", "chunk4", "chunk5"]
    )