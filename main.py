from src.ingestion.collectors.resume import extract_text_from_pdf
from src.ingestion.processors.chunker import chunk_text

PDF_PATH = r"D:\Ubaid\github\HireMeAI\data\resume.pdf"



def main():
    text = extract_text_from_pdf(PDF_PATH)
    chunks = chunk_text(text)
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i + 1}:\n{chunk}\n")


if __name__ == "__main__":
    main()
