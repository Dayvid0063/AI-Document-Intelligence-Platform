from celery import Celery
from app.worker import celery_app
from app.core.database import SessionLocal
from app.models.document import Document
from app.services.ocr_service import extract_text
from app.services.ai_service import analyze_document
from app.services.embedding_service import generate_embedding
from app.services.document_service import (
    update_document_text,
    update_document_ai_results,
    update_document_embedding,
)
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_document_pipeline(self, doc_id: str):
    """
    Background task to process a document through the full pipeline:
    OCR -> AI Analysis -> Embedding

    Args:
        doc_id: String ID of the document to process

    Returns:
        Dict with status and document info
    """
    # Create a new database session for this task
    db = SessionLocal()
    try:
        # Fetch the document from database
        document = db.query(Document).filter(Document.id == doc_id).first()

        if not document:
            logger.error(f"Document {doc_id} not found")
            return {"status": "error", "message": "Document not found"}

        # Update status to processing
        document.status = "processing"
        db.commit()

        logger.info(f"Starting processing for document {doc_id}")

        # Step 1: OCR Extraction
        try:
            extracted_text = extract_text(document.file_path, document.mime_type)
            document = update_document_text(str(document.id), extracted_text, db)

            if not extracted_text or len(extracted_text.strip()) == 0:
                raise Exception("OCR extracted no text")

        except Exception as e:
            logger.error(f"OCR failed for document {doc_id}: {str(e)}")
            document.status = "failed"
            db.commit()
            # Don't retry OCR failures - they're usually permanent
            raise self.retry(exc=e, countdown=120, max_retries=1)  # Retry once after 2 minutes

        # Step 2: AI Analysis
        try:
            ai_result = analyze_document(extracted_text)
            document = update_document_ai_results(
                doc_id=str(document.id),
                document_type=ai_result["document_type"],
                summary=ai_result["summary"],
                extracted_fields=ai_result["extracted_fields"],
                db=db,
            )
        except Exception as e:
            logger.error(f"AI analysis failed for document {doc_id}: {str(e)}")
            document.status = "failed"
            db.commit()
            # Retry AI failures - could be transient API issues
            raise self.retry(exc=e, countdown=60, max_retries=3)  # Retry up to 3 times

        # Step 3: Generate Embedding
        try:
            embedding = generate_embedding(extracted_text)
            if embedding:
                document = update_document_embedding(str(document.id), embedding, db)
                document.status = "completed"
                logger.info(f"Document {doc_id} processing completed successfully")
            else:
                raise Exception("Embedding generation returned None")
        except Exception as e:
            logger.error(f"Embedding generation failed for document {doc_id}: {str(e)}")
            document.status = "failed"
            db.commit()
            # Retry embedding failures - could be transient API issues
            raise self.retry(exc=e, countdown=60, max_retries=3)  # Retry up to 3 times

        db.commit()
        return {
            "status": "success",
            "document_id": str(document.id),
            "document_status": document.status
        }

    except Exception as e:
        logger.error(f"Task failed for document {doc_id}: {str(e)}")
        # Make sure we mark as failed if we got here due to max retries exceeded
        try:
            document = db.query(Document).filter(Document.id == doc_id).first()
            if document and document.status not in ["failed", "completed"]:
                document.status = "failed"
                db.commit()
        except:
            pass  # Don't let error handling fail on top of original error
        raise  # Re-raise to mark task as failed in Celery

    finally:
        db.close()