"""
Extracts the text from a PDF file and returns it. 
"""

from pypdf import PdfReader
from pathlib import Path


def extract_text_from_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text
    return text