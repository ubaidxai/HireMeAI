from src.services.openai.client import client
from src.settings import settings


async def embed_texts(texts: list[str]):
    response = await client.embeddings.create(
        model=settings.openai_embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]