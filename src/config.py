from pydantic_settings import BaseSettings


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

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "portfolio"

    # Metrics
    # LangChain
    langchain_api_key: str
    langchain_project: str = "HireMeAI"
    langchain_tracing_v2: bool = True

    metrics_file: str = "data/metrics.json"

    eval_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()