import uuid 
from src.settings import settings
from qdrant_client.models import PointStruct
from src.services.qdrant.client import qdrant_client, ensure_collection 


async def store_embeddings(text: str, chunks, vectors, metadata: dict = {}):
    await ensure_collection()

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"text": text, **metadata}
        )
        for chunk, vector in zip(chunks, vectors)
    ]
    await qdrant_client.upsert(collection_name=settings.qdrant_collection, points=points)
    print(f"Stored {len(points)} chunks into '{settings.qdrant_collection}'")