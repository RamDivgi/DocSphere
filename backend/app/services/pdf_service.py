from pathlib import Path
import os
import uuid

import fitz
from fastapi import UploadFile, HTTPException

# Base storage path
BASE_STORAGE = Path(os.getenv("STORAGE_PATH", "."))

# Upload directory
UPLOAD_DIR = BASE_STORAGE / "uploads" / "pdfs"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class PDFService:

    MAX_FILE_SIZE = 20 * 1024 * 1024

    @staticmethod
    async def save_pdf(file: UploadFile):

        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        content = await file.read()

        if len(content) > PDFService.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Maximum size is 20MB."
            )

        stored_filename = f"{uuid.uuid4()}.pdf"

        path = UPLOAD_DIR / stored_filename

        with open(path, "wb") as f:
            f.write(content)

        document = fitz.open(path)

        pages = document.page_count

        text = ""

        for page in document:
            text += page.get_text()

        document.close()

        if not text.strip():
            try:
                path.unlink()
            except Exception:
                pass

            raise HTTPException(
                status_code=400,
                detail="PDF contains no extractable text. Please upload a digital PDF with selectable text."
            )

        return {
            "filename": file.filename,
            "stored_filename": stored_filename,
            "file_size": len(content),
            "page_count": pages,
            "text": text,
            "path": str(path),
        }