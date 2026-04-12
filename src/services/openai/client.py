from openai import AsyncOpenAI
from src.settings import settings

client = AsyncOpenAI(
    api_key=settings.openai_api_key,
    max_retries=settings.max_retries,
    timeout=settings.timeout,
)
