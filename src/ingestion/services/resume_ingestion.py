from src.utils.extract_pdf import extract_text_from_pdf
from src.ingestion.chunking.resume_chunking import chunk_resume
from src.services.openai.embeddings import embed_texts
from src.services.qdrant.store import store_embeddings


async def run_ingestion(file):
    try:
        # Step 1: Extract text from the PDF
        resume_text = extract_text_from_pdf(file)

        # Step 2: chunk the text
        chunks = chunk_resume(resume_text)

        # Step 3: Embed the chunks
        texts = [chunk["content"] for chunk in chunks]
        embeddings = await embed_texts(texts)

        # Step 4: Store the embeddings in the vector database with metadata
        await store_embeddings(resume_text, chunks, embeddings, metadata=[{"source": "resume", "file": file} for _ in chunks])
    except Exception as e:
        print(f"Ingestion Successfull.")
