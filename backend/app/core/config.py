from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized application settings.
    Values are loaded from environment variables / .env file.
    """

    # --- App ---
    APP_NAME: str = "AI Document Intelligence Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str

    # --- JWT Auth ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- DeepSeek AI (classification, summarization, RAG chat) ---
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-v4-flash"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # --- OpenAI (embeddings only) ---
    OPENAI_API_KEY: str = ""

    # --- Cloudflare R2 (file storage) ---
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "docintel-uploads"
    R2_ENDPOINT: str = ""  # https://<account_id>.r2.cloudflarestorage.com

    # --- CORS ---
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()