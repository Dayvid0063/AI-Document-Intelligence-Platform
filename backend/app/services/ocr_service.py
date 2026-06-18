import os
import pytesseract
from PIL import Image
from pypdf import PdfReader
from pdf2image import convert_from_path

# If Tesseract is not on PATH, point directly to the executable.
# This is the default install path on Windows — adjust if yours differs.
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Poppler bin path for pdf2image on Windows
# Download poppler and update this path to match your install location
POPPLER_PATH = r"C:\Program Files\poppler\Library\bin"


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file.

    Strategy:
    1. Try pypdf first — works great for text-based PDFs (digitally created).
    2. If pypdf returns little/no text, the PDF is likely scanned (image-based).
       Fall back to pdf2image + pytesseract to OCR each page as an image.
    """
    # Attempt 1: pypdf direct text extraction
    text = _extract_with_pypdf(file_path)

    # If we got meaningful text, return it
    if len(text.strip()) > 50:
        return text.strip()

    # Attempt 2: OCR fallback for scanned PDFs
    return _extract_with_ocr_fallback(file_path)


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from an image file (PNG, JPG, TIFF) using Tesseract OCR.
    """
    image = Image.open(file_path)
    text = pytesseract.image_to_string(image)
    return text.strip()


def extract_text(file_path: str, mime_type: str) -> str:
    """
    Main entry point — routes to the right extractor based on file type.

    Args:
        file_path: Path to the file on disk
        mime_type: MIME type of the file (e.g. "application/pdf", "image/png")

    Returns:
        Extracted text string, or empty string if extraction fails
    """
    try:
        if mime_type == "application/pdf":
            return extract_text_from_pdf(file_path)
        elif mime_type in ("image/png", "image/jpeg", "image/jpg", "image/tiff"):
            return extract_text_from_image(file_path)
        else:
            return ""
    except Exception as e:
        # Log and return empty string — don't crash the endpoint
        print(f"OCR extraction failed for {file_path}: {e}")
        return ""


# ---- Private helpers ----

def _extract_with_pypdf(file_path: str) -> str:
    """Use pypdf to extract text directly from a PDF."""
    reader = PdfReader(file_path)
    pages_text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages_text.append(page_text)
    return "\n".join(pages_text)


def _extract_with_ocr_fallback(file_path: str) -> str:
    """
    Convert each PDF page to an image, then run Tesseract OCR on each.
    Used when pypdf can't extract text (scanned/image-based PDFs).
    """
    try:
        # Convert PDF pages to PIL images
        poppler_path = POPPLER_PATH if os.path.exists(POPPLER_PATH) else None
        images = convert_from_path(file_path, poppler_path=poppler_path)

        pages_text = []
        for image in images:
            text = pytesseract.image_to_string(image)
            if text.strip():
                pages_text.append(text.strip())

        return "\n".join(pages_text)
    except Exception as e:
        print(f"OCR fallback failed: {e}")
        return ""