from src.ingestion.embeddings.engine import embed_and_store
from utils.extract_pdf import extract_text_from_pdf
import asyncio
from src.retrieval.retriever import retrieve_chunks
from utils.extract_pdf import extract_text_from_pdf

PDF_PATH = r"/home/gokburo09/github/HireMeAI/data/resume.pdf"


def run_ingestion():
    text = extract_text_from_pdf(PDF_PATH)
    asyncio.run(embed_and_store(text, metadata={"source": "resume", "file": "resume.pdf"}))


def run_retrieval():
    query = "What skills does ubaid got when working at HashMove?"
    results = asyncio.run(retrieve_chunks(query, top_k=5))
    # for r in results:
    #     print(f"Score: {r['score']:.3f} | Text: {r['text'][:100]}... | Metadata: {r['metadata']}")
    for r in results:
        print(f"Score: {r['score']:.3f}")
        print(f"Text: {r['text']}")  # remove the slice/truncation
        print("---")

def run_agent():
    from src.agents.runner import run_agent
    response = run_agent("What skills does ubaid got when working at HashMove? Explain in two lines.")
    print("Agent Response:")
    print(response)


if __name__ == "__main__":
    run_ingestion()
    # run_retrieval()
    # run_agent()