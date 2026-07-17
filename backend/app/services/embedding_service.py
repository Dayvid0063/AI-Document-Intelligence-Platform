from openai import OpenAI
from app.core.config import settings

# Separate OpenAI client specifically for embeddings
# DeepSeek client (in ai_service.py) handles everything else
openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

# OpenAI's text-embedding-3-small
# 1536 dimensions, $0.02/1M tokens
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

# Max characters to embed
MAX_CHARS = 8000


def generate_embedding(text: str) -> tuple[list[float] | None, int]:
    """
    Convert text into a 1536-dimensional vector using OpenAI's
    text-embedding-3-small model.

    Returns (embedding, input_tokens). embedding is None if embedding fails.

    Cost: ~$0.02 per 1M tokens — embedding a typical document
    costs less than $0.00001.
    """
    if not text or len(text.strip()) < 10:
        return None, 0

    text_to_embed = text[:MAX_CHARS].strip()

    try:
        response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text_to_embed,
        )
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        return response.data[0].embedding, input_tokens

    except Exception as e:
        print(f"[EMBEDDING ERROR]: {type(e).__name__}: {e}")
        return None, 0