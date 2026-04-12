from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # App
    app_name: str = "HireMeAI"
    data_dir: str = "/home/gokburo09/github/HireMeAI/data/"
    pdf_path: str = data_dir + "resume.pdf"
    user_name: str = "Ubaid"

    # Chunks
    chunk_size: int = 200
    chunk_overlap: int = 50

    # retrival
    top_k: int = 5

    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_embedding_dim: int = 1536
    max_retries: int = 2
    timeout: float = 30.0

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "portfolio"

    # Metrics
    # LangSmith
    langsmith_api_key: str
    langsmith_project: str = "HireMeAI"
    langsmith_tracing_v2: bool = True

    metrics_file: str = "data/metrics.json"

    eval_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project