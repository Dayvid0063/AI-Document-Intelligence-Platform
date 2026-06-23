import os
import tempfile
import pytesseract
from PIL import Image
from pypdf import PdfReader
from pdf2image import convert_from_bytes

from app.services.storage_service import download_file

# Windows Tesseract path — ignored on Linux (Railway) where tesseract is on PATH
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Windows Poppler path — ignored on Linux (Railway)
POPPLER_PATH = r"C:\Program Files\poppler\Library\bin" if os.name == "nt" else None


def extract_text(file_path: str, mime_type: str) -> str:
    """
    Main entry point — downloads file from R2 into a temp file,
    runs OCR, then cleans up the temp file.

    Args:
        file_path: R2 object key (e.g. "documents/abc123.pdf")
        mime_type: MIME type of the file

    Returns:
        Extracted text string, or empty string if extraction fails
    """
    try:
        # Download file bytes from R2
        file_bytes = download_file(file_path)

        if mime_type == "application/pdf":
            return _extract_from_pdf_bytes(file_bytes)
        elif mime_type in ("image/png", "image/jpeg", "image/jpg", "image/tiff"):
            return _extract_from_image_bytes(file_bytes)
        else:
            return ""

    except Exception as e:
        print(f"[OCR ERROR]: {type(e).__name__}: {e}")
        return ""


def _extract_from_pdf_bytes(file_bytes: bytes) -> str:
    """
    Extract text from PDF bytes.

    Strategy:
    1. Try pypdf first — works for text-based PDFs
    2. If insufficient text returned, fall back to Tesseract OCR
       (for scanned/image-based PDFs)
    """
    # Attempt 1: pypdf direct extraction (write to temp file)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        text = _extract_with_pypdf(tmp_path)
        if len(text.strip()) > 50:
            return text.strip()
    finally:
        os.unlink(tmp_path)  # Always clean up temp file

    # Attempt 2: OCR fallback for scanned PDFs
    return _extract_with_ocr_fallback(file_bytes)


def _extract_from_image_bytes(file_bytes: bytes) -> str:
    """Extract text from image bytes using Tesseract OCR."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        image = Image.open(tmp_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    finally:
        os.unlink(tmp_path)


def _extract_with_pypdf(file_path: str) -> str:
    """Use pypdf to extract text directly from a PDF file."""
    reader = PdfReader(file_path)
    pages_text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages_text.append(page_text)
    return "\n".join(pages_text)


def _extract_with_ocr_fallback(file_bytes: bytes) -> str:
    """
    Convert PDF pages to images using pdf2image (from bytes),
    then run Tesseract OCR on each page image.
    """
    try:
        poppler_path = POPPLER_PATH if POPPLER_PATH and os.path.exists(POPPLER_PATH) else None
        images = convert_from_bytes(file_bytes, poppler_path=poppler_path)

        pages_text = []
        for image in images:
            text = pytesseract.image_to_string(image)
            if text.strip():
                pages_text.append(text.strip())

        return "\n".join(pages_text)
    except Exception as e:
        print(f"[OCR FALLBACK ERROR]: {e}")
        return ""