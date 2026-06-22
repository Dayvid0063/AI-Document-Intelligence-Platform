from openai import OpenAI
from sqlalchemy.orm import Session
from pgvector.sqlalchemy import Vector

from app.core.config import settings
from app.models.document import Document
from app.models.user import User
from app.services.embedding_service import generate_embedding

client = OpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.DEEPSEEK_BASE_URL,
)

RAG_SYSTEM_PROMPT = """You are a helpful document assistant. You answer questions 
based ONLY on the document content provided to you. 

Rules:
- Only use information from the provided document excerpts
- If the answer is not in the documents, say so clearly
- Be concise and direct
- Quote relevant parts when helpful
- For financial figures, be precise"""


def semantic_search(
    query: str,
    current_user: User,
    db: Session,
    limit: int = 5,
) -> list[Document]:
    """
    Search the user's documents by semantic meaning.

    Steps:
    1. Convert the search query to an embedding vector
    2. Find documents whose embeddings are closest to the query vector
       using pgvector's cosine distance operator (<=>)
    3. Return the top matches

    This finds relevant documents even if they don't contain
    the exact search words.
    """
    query_embedding = generate_embedding(query)

    if query_embedding is None:
        # Fall back to simple text search if embedding fails
        return (
            db.query(Document)
            .filter(
                Document.user_id == current_user.id,
                Document.extracted_text.ilike(f"%{query}%"),
            )
            .limit(limit)
            .all()
        )

    # cosine distance search — finds semantically similar documents
    # <=> is pgvector's cosine distance operator (lower = more similar)
    results = (
        db.query(Document)
        .filter(
            Document.user_id == current_user.id,
            Document.embedding.isnot(None),
        )
        .order_by(Document.embedding.op("<=>")(query_embedding))
        .limit(limit)
        .all()
    )

    return results


def chat_with_document(
    question: str,
    doc_id: str,
    current_user: User,
    db: Session,
) -> str:
    """
    Answer a question about a specific document using RAG.

    Steps:
    1. Fetch the document (validates ownership)
    2. Build context from extracted text + AI summary + extracted fields
    3. Send context + question to DeepSeek
    4. Return the answer
    """
    document = (
        db.query(Document)
        .filter(Document.id == doc_id, Document.user_id == current_user.id)
        .first()
    )

    if not document:
        return "Document not found."

    if not document.extracted_text:
        return "This document has not been processed yet. Please run OCR first."

    # Build rich context from everything we know about the document
    context_parts = []

    if document.document_type:
        context_parts.append(f"Document type: {document.document_type}")

    if document.summary:
        context_parts.append(f"Summary: {document.summary}")

    if document.extracted_fields:
        import json
        context_parts.append(
            f"Extracted fields: {json.dumps(document.extracted_fields, indent=2)}"
        )

    context_parts.append(f"Full document text:\n{document.extracted_text[:10000]}")

    context = "\n\n".join(context_parts)

    try:
        response = client.chat.completions.create(
            model=settings.DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": RAG_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Document content:\n\n{context}\n\nQuestion: {question}",
                },
            ],
            max_tokens=800,
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[RAG ERROR]: {e}")
        return "I encountered an error while processing your question. Please try again."


def chat_with_all_documents(
    question: str,
    current_user: User,
    db: Session,
) -> dict:
    """
    Answer a question by searching across ALL of the user's documents.

    Steps:
    1. Use semantic search to find the most relevant documents
    2. Build combined context from top matches
    3. Ask DeepSeek to answer based on that context
    4. Return answer + source documents
    """
    # Find the most relevant documents
    relevant_docs = semantic_search(question, current_user, db, limit=3)

    if not relevant_docs:
        return {
            "answer": "You have no processed documents to search through yet.",
            "sources": [],
        }

    # Build combined context from top results
    context_parts = []
    sources = []

    for i, doc in enumerate(relevant_docs):
        if not doc.extracted_text:
            continue

        sources.append({
            "id": str(doc.id),
            "filename": doc.original_filename,
            "document_type": doc.document_type,
        })

        doc_context = f"[Document {i+1}: {doc.original_filename}]\n"
        if doc.summary:
            doc_context += f"Summary: {doc.summary}\n"
        doc_context += f"Text: {doc.extracted_text[:3000]}"
        context_parts.append(doc_context)

    if not context_parts:
        return {
            "answer": "No processed documents found to answer your question.",
            "sources": [],
        }

    combined_context = "\n\n---\n\n".join(context_parts)

    try:
        response = client.chat.completions.create(
            model=settings.DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": RAG_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Here are the relevant documents:\n\n{combined_context}"
                        f"\n\nQuestion: {question}"
                    ),
                },
            ],
            max_tokens=800,
            temperature=0.2,
        )

        return {
            "answer": response.choices[0].message.content.strip(),
            "sources": sources,
        }

    except Exception as e:
        print(f"[RAG ERROR]: {e}")
        return {
            "answer": "I encountered an error while processing your question.",
            "sources": [],
        }