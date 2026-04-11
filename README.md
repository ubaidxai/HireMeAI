# HireMeAI
 
An agentic RAG system that acts as an AI version of you — answering questions about your background, skills, and experience from recruiters and potential clients.
 
Built with LangGraph, Qdrant, OpenAI, FastAPI, and Streamlit. Fully observable with LangSmith tracing and RAGAS evaluation.


---
 
## What it does
 
- Ingests your resume, LinkedIn export, GitHub, and portfolio website
- Chunks and embeds your data into a Qdrant vector store
- Answers questions via a LangGraph agent that retrieves relevant context before generating responses
- Exposes a FastAPI backend and Streamlit frontend
- Tracks latency, token usage, cost (LangSmith) and RAG quality metrics (RAGAS)
 
---
 
## Build Phases
 
| Phase | Scope |
|---|---|
| **1 — Core** | PDF → chunks → embeddings → Qdrant → RAG query → FastAPI |
| **2 — Quality** | Smart chunking · metadata · all data sources · reranker · RAGAS evals |
| **3 — Production** | Hybrid retrieval · Redis cache · incremental updates · multi-tenancy |
| **4 — Agentic** | LangGraph tool use · guardrails · conversation memory |
 
---
 
## Tech Stack
 
| Layer | Tool |
|---|---|
| Agent framework | LangGraph |
| Vector DB | Qdrant |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI `gpt-4o-mini` |
| API | FastAPI |
| Frontend | Streamlit |
| Tracing | LangSmith |
| RAG evals | RAGAS |
| Package manager | uv |
| Hosting | Render |
 
---

## Project Structure
```bash
portfolio-rag/
│
├── .env.example                    # Environment variables template
├── docker-compose.yml              # Docker services definition
├── Makefile                        # Development shortcuts and commands
│
├── src/
|   ├── ingestion/                      # Data ingestion pipeline
|   │   ├── dags/                       # Airflow / Prefect DAGS
|   │   │   ├── daily_ingest.py         # Master daily ingestion DAG
|   │   │   └── backfill_dag.py         # Backfill historical data DAG
|   │   ├── collectors/                 # Data source collectors
|   │   │   ├── base.py                 # Abstract Collector base class
|   │   │   ├── linkedin.py
|   │   │   ├── github.py
|   │   │   ├── resume.py
|   │   │   └── website.py
|   │   ├── processors/                 # Document processing pipeline
|   │   │   ├── parser.py               # Unstructured.io wrapper
|   │   │   ├── cleaner.py
|   │   │   ├── chunker.py              # Chunking strategies (strategy pattern)
|   │   │   └── metadata.py
|   │   ├── embeddings/                 # Embedding generation
|   │   │   ├── engine.py               # Async batch embedding engine
|   │   │   └── registry.py             # Model registry
|   │   └── storage/                    # Vector and document storage
|   │       ├── vector_store.py         # Qdrant client wrapper
|   │       ├── doc_store.py            # MongoDB wrapper
|   │       └── change_detector.py      # Content hash-based change detection
|   │
|   ├── retrieval/                      # Core RAG retrieval pipeline
|   │   ├── query_processor.py          # Query expansion, HyDE, intent detection
|   │   ├── retriever.py                # Hybrid search (vector + keyword)
|   │   ├── reranker.py                 # Reranking logic
|   │   ├── context_assembler.py        # Context building and formatting
|   │   └── generator.py                # LLM response generation + prompt templates
|   │
|   ├── agents/                         # Phase 2 — Agentic capabilities (LangGraph)
|   │   ├── graph.py                    # Main LangGraph state machine
|   │   ├── tools/
|   │   │   ├── web_search.py
|   │   │   └── github_api.py
|   │   ├── guardrails.py               # Safety and validation guards
|   │   ├── llms.py
|   │   └── memory.py                   # Agent memory management
|   │
|   ├── config/
|   ├── evals/
|   │   ├── ragas_suite.py              # RAGAS evaluation suite
|   │   ├── golden_dataset.json         # Curated golden Q&A dataset
|   │   └── run_evals.py                # Script to run evaluations
|   ├── monitoring/
│   │   ├── langsmith_config.py
│   │   ├── metrics.py                  # Prometheus metrics
│   │   └── alerts.py
|   └── tests/
|       ├── unit/
|       ├── integration/
|       └── e2e/
│
├── api/                            # FastAPI backend
│   ├── main.py                     # FastAPI application entry point
│   ├── routes/
│   │   ├── query.py                # Query endpoints
│   │   └── ingest.py               # Ingestion trigger endpoints
│   ├── schemas.py                  # Pydantic request/response models
│   └── middleware.py               # Auth, rate limiting, tracing, etc.
│
│
└── notebooks/                      # Jupyter notebooks (exploration only)
    ├── chunk_experiments.ipynb
    └── eval_analysis.ipynb
```

---
 
## Setup
 
### Prerequisites
 
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) — package manager
- Docker — for running Qdrant
 
> **Windows users:** See [docs/setup-wsl.md](docs/setup-wsl.md) for WSL setup before continuing.
 
### 1. Clone and install
 
```bash
git clone https://github.com/ubaidxai/HireMeAI.git
cd HireMeAI
uv sync
```
 
### 2. Configure environment
 
```bash
cp .env.example .env
```
 
Edit `.env` and fill in your keys:
 
```bash
OPENAI_API_KEY=sk-...
LANGSMITH_API_KEY=ls__...
LANGSMITH_PROJECT=HireMeAI
LANGSMITH_TRACING=true
QDRANT_HOST=localhost
QDRANT_PORT=6333
```
 
### 3. Start Qdrant
 
See [docs/setup-qdrant.md](docs/setup-qdrant.md) for full Qdrant setup.
 
Quick start:
 
```bash
docker compose up -d qdrant
```
 
Qdrant dashboard → [http://localhost:6333/dashboard](http://localhost:6333/dashboard)
 
### 4. Ingest your resume
 
Place your resume PDF at `data/resume.pdf`, then run:
 
```bash
uv run main.py
```
 
---
 
## Running
 
### API
 
```bash
uvicorn apps.api.main:app --reload
```
 
API available at [http://localhost:8000](http://localhost:8000)
 
### Streamlit webapp
 
```bash
uv run streamlit run apps/webapp/main.py
```
 
Webapp available at [http://localhost:8501](http://localhost:8501)
 
### Full stack with Docker
 
```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Qdrant dashboard | http://localhost:6333/dashboard |
| FastAPI | http://localhost:8000 |
| Streamlit | http://localhost:8501 |
 
---

## Observability
 
**LangSmith** — automatic tracing of every agent run. View latency, token usage, and cost per query at [smith.langchain.com](https://smith.langchain.com).
 
**RAGAS** — evaluate RAG quality against your golden dataset from the Streamlit dashboard under the "Run Evals" tab. Scores (faithfulness, answer relevancy, context recall) are saved to `data/metrics.json`.
 
---
 
## Environment Variables
 
| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key | required |
| `OPENAI_MODEL` | LLM model | `gpt-4o-mini` |
| `OPENAI_EMBEDDING_MODEL` | Embedding model | `text-embedding-3-small` |
| `QDRANT_HOST` | Qdrant host | `localhost` |
| `QDRANT_PORT` | Qdrant port | `6333` |
| `QDRANT_COLLECTION` | Collection name | `portfolio` |
| `LANGSMITH_API_KEY` | LangSmith API key | required for tracing |
| `LANGSMITH_PROJECT` | LangSmith project name | `HireMeAI` |
| `LANGSMITH_TRACING` | Enable tracing | `true` |
| `TOP_K` | Retrieval results count | `5` |
| `CHUNK_SIZE` | Chunk size in chars | `150` |
| `CHUNK_OVERLAP` | Chunk overlap in chars | `20` |








---
---
---
# CLAUDE:
![alt text](image.png)
### Tech Stack Recommendations:
Your instincts are solid — here are the upgrades and reasoning
- Orchestration: Your Airflow pick is correct for a scheduled ingestion DAG. Pair it with Prefect/Temporal or stay pure Airflow — but add Celery + Redis as the task queue behind it so heavy embedding jobs don't block the DAG scheduler. For the agentic query layer, use LangGraph over plain LangChain — it gives you stateful graph-based agent loops which you'll need for Phase 2 ReAct patterns. Skip the OpenAI Agents SDK unless you're fully committed to OpenAI; LangGraph is model-agnostic.
- Vector DB — upgrade from FAISS: FAISS is an in-memory library, not a production DB. Use Qdrant instead — it's self-hostable, supports hybrid search (dense + sparse BM25 in one query), has payload filtering, and has a great Python SDK. OpenSearch is a valid alternative if you already have it in your stack, but Qdrant is purpose-built and much simpler to operate for this use case.
- Embeddings — upgrade from LINA: Use text-embedding-3-large (OpenAI) for quality, or embed-english-v3.0 (Cohere) if you want built-in reranking from the same vendor. For a fully open-source path, bge-m3 from BAAI is excellent and multilingual.
- Document Parsing: Add Unstructured.io to your stack — it handles PDFs, DOCX, HTML, Markdown, and even images/tables inside documents with a single unified API. This is the biggest productivity unlock in the ingestion pipeline.
- Reranking: Add Cohere Rerank or cross-encoder/ms-marco-MiniLM (open source) as a second-stage filter after vector retrieval. This alone improves answer quality dramatically.
- LLM: Keep it model-agnostic via LangChain's chat model interface. Use Claude Sonnet or GPT-4o as primary, with a fallback chain.
- Evals: RAGAS is the standard for RAG-specific metrics (faithfulness, answer relevancy, context recall, context precision). Pair it with LangSmith for tracing and Arize Phoenix for production drift monitoring.
- Missing pieces you should add:
    - Redis — semantic query cache (cache embeddings of past queries, return hits without re-querying the vector DB)
    - MongoDB — raw document store alongside Qdrant (keep original chunks for debugging and reprocessing) 
    - FastAPI — serve the query endpoint
    - Pydantic — data contracts between pipeline stages (critical for production)
    - Docker Compose → Kubernetes — container the whole stack from day one





Things You Hadn't Listed That Matter
1. Chunking strategy is your biggest quality lever. Don't default to fixed-size chunks. Implement a hierarchical RAPTOR-style tree: small chunks (256 tokens) for precision, their parent summaries (1024 tokens) for context. Store both in Qdrant with a parent_id link. Retrieve small, expand to parent for context assembly.
2. Content hash-based incremental updates. On every daily run, hash each document. Only re-embed chunks where the hash changed. This cuts embedding cost by ~90% on stable profiles.
3. Golden eval dataset first. Before you write a single line of ingestion code, manually write 20–30 Q&A pairs about yourself. These become your ground truth. Every pipeline decision gets validated against this set.
4. Multi-tenancy from day one. Even if it's just you now, namespace everything in Qdrant by user_id. You said "for anyone" — this is the architecture decision that makes or breaks that goal.
5. Semantic query cache. Embed the incoming query, check Redis for a cosine-similar cached query (threshold ~0.97). Return the cached answer instantly. Portfolio agents get repetitive "what are your skills?" questions — this cuts latency to <50ms for hits.
6. Prompt versioning. Store your system prompts in a YAML file with version tags, not hardcoded in Python. When evals regress, you can git blame a prompt change.


Want me to start generating the actual code for any specific component — the Airflow DAG, the LangGraph agent graph, the Qdrant hybrid retriever, or the RAGAS eval suite?


every chunk should have:
{
  "source": "github",
  "type": "project",
  "tech": ["fastapi", "rag"],
  "importance": 0.9,
  "timestamp": "...",
  "user_id": "..."
}


| Type       | Tool       |
| ---------- | ---------- |
| Raw Data   | S3 / MinIO |
| Structured | Postgres   |
| Vector     | Qdrant     |
| Cache      | Redis      |


OBSERVABILITY:
- OpenTelemetry
- Prometheus + Grafana
- Structured logs (JSON)