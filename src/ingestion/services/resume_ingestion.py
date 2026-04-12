# Receive the pdf
# Extract text from the pdf
# Chunk the text
# Embed the chunks
# Store the embeddings in the vector database
# Return the ingestion status and chunks metadata to the user
# from src.ingestion.embeddings.engine import embed_and_store
from src.utils.extract_pdf import extract_text_from_pdf
from src.ingestion.chunking.resume_chunking import chunk_resume
from src.services.openai.embeddings import embed_texts
import asyncio


def run_ingestion(file):
    # Step 1: Extract text from the PDF
    resume_text = extract_text_from_pdf(file)

    # Step 2: chunk the text
    chunks = chunk_resume(resume_text)

    # Step 3: Embed the chunks
    texts = [chunk["content"] for chunk in chunks]
    embeddings = embed_texts(texts)

    # Step 4: Store the embeddings in the vector database with metadata
    # store_embeddings(embeddings, metadata=[{"source": "resume", "file": file} for _ in chunks])
    



    # pass
    # asyncio.run(embed_and_store(text, metadata={"source": "resume", "file": "resume.pdf"}))



# def ingest_resume(file):
#     pass


