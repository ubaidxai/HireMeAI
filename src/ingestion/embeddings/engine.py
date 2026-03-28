from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from dotenv import load_dotenv
from src.services.qdrant import ensure_collection
from qdrant_client.models import Distance, VectorParams, PointStruct
from src.ingestion.processors.chunker import chunk_text
import uuid

load_dotenv()

openai_client = AsyncOpenAI()    
qdrant_client = AsyncQdrantClient(host="localhost", port=6333)
EMBEDDING_MODEL = "text-embedding-3-small"
COLLECTION_NAME = "portfolio"


async def embed_and_store(text: str, metadata: dict = {}):
    await ensure_collection()

    chunks = chunk_text(text)

    response = await openai_client.embeddings.create(
        input=chunks,
        model=EMBEDDING_MODEL,
    )
    vectors = [item.embedding for item in response.data]

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"text": text, **metadata}
        )
        for chunk, vector in zip(chunks, vectors)
    ]
    await qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"Stored {len(points)} chunks into '{COLLECTION_NAME}'")