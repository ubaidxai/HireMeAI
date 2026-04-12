
HEADINGS = {
    "summary": ["summary", "professional summary", "profile"],
    "skills": ["skills", "technical skills", "soft skills"],
    "experience": ["experience", "work experience", "professional experience"],
    "projects": ["projects", "personal projects", "professional projects"],
    "education": ["education", "academic background", "qualifications"],
    "certifications": ["certifications", "licenses"],
    "achievements": ["achievements", "accomplishments", "honors", "leadership", "extracurricular", "activities", "leadership & awards"],
}


def normalize_heading(line: str) -> str:
    line = line.strip().lower()
    for heading, keywords in HEADINGS.items():
        for k in keywords:
            if k in line:
                return heading
    return None


def chunk_resume(text: str):
    lines = text.splitlines()

    chunks = []
    current_heading = "general"
    buffer = []

    for line in lines:
        heading = normalize_heading(line)

        # If we hit a new heading and have buffered content, save it as a chunk
        if heading:
            if buffer:
                chunks.append({
                    "heading": current_heading, 
                    "content": current_heading.upper() + "\n" + "\n".join(buffer).strip()
                })
                buffer = []

            current_heading = heading
        else:
            buffer.append(line)

    # Handle the last buffered content at the end of the document
    if buffer:
        chunks.append({
            "heading": current_heading, 
            "content": current_heading.upper() + "\n" + "\n".join(buffer).strip()
        })

    return chunks