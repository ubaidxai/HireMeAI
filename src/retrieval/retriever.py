from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from dotenv import load_dotenv
import asyncio

load_dotenv()

openai_client = AsyncOpenAI()    
qdrant_client = AsyncQdrantClient(host="localhost", port=6333)
EMBEDDING_MODEL = "text-embedding-3-small"
COLLECTION_NAME = "portfolio"


async def retrieve_chunks(query: str, top_k: int = 5) -> list[dict]:
    openai_embed = await openai_client.embeddings.create(
        input=[query],
        model=EMBEDDING_MODEL,
    )
    embedded_query = openai_embed.data[0].embedding

    search_result = await qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedded_query,
        limit=top_k,
        with_payload=True,
    )
    return [
        {
            "text": hit.payload.get("text", ""),
            "score": hit.score,
            "metadata": {k: v for k, v in hit.payload.items() if k != "text"},
        }
        for hit in search_result.points 
    ]


def retrieve_chunks_sync(query: str) -> list[dict]:
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
        return loop.run_until_complete(retrieve_chunks(query))
    except RuntimeError:
        return asyncio.run(retrieve_chunks(query))