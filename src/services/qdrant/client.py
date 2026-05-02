from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams
from src.settings import settings

COLLECTION_NAME = settings.qdrant_collection
EMBEDDING_DIM   = settings.qdrant_embeddings_dim

qdrant_client = AsyncQdrantClient(
    host=settings.qdrant_host, 
    port=settings.qdrant_port
    )

async def ensure_collection():
    existing_collections = [c.name for c in (await qdrant_client.get_collections()).collections]
    if settings.COLLECTION_NAME not in existing_collections:
        print(f"Creating collection '{COLLECTION_NAME}'...")
        await qdrant_client.create_collection( #recreate_collection
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE)
        )
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")