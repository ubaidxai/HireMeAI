from pydantic import BaseModel
from typing import Optional, List


class IngestionResponse(BaseModel):
    status: str
    message: str
    source: str
    chunks_created: Optional[int] = None
    chunk_ids: Optional[List[str]] = None