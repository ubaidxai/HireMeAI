from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams


COLLECTION_NAME = "portfolio"
EMBEDDING_DIM   = 1536

qdrant_client = AsyncQdrantClient(host="localhost", port=6333)

async def ensure_collection():
    existing_collections = [c.name for c in (await qdrant_client.get_collections()).collections]
    if COLLECTION_NAME not in existing_collections:
        print(f"Creating collection '{COLLECTION_NAME}'...")
        await qdrant_client.create_collection( #recreate_collection
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE)
        )
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")