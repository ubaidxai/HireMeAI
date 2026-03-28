"""
Extracts the text from a PDF file and returns it. 
"""


import fitz
from pathlib import Path

def extract_text_from_pdf(file_path: Path) -> str:
    doc = fitz.open(file_path)
    return "\n\n".join(page.get_text() for page in doc)