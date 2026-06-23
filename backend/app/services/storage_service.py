import uuid
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config

from app.core.config import settings

# boto3 client pointed at Cloudflare R2's S3-compatible endpoint
# R2 uses the same API as AWS S3, so the boto3 SDK works perfectly
def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_file(file_bytes: bytes, original_filename: str, mime_type: str) -> tuple[str, str]:
    """
    Upload a file to Cloudflare R2.

    Returns:
        (stored_filename, object_key) where:
        - stored_filename: UUID-based filename (e.g. "abc123.pdf")
        - object_key: full R2 path (e.g. "documents/abc123.pdf")

    The object_key is what we store in the DB as file_path.
    """
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    stored_filename = f"{uuid.uuid4()}.{ext}" if ext else str(uuid.uuid4())
    object_key = f"documents/{stored_filename}"

    client = get_r2_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=object_key,
        Body=file_bytes,
        ContentType=mime_type,
    )

    return stored_filename, object_key


def download_file(object_key: str) -> bytes:
    """
    Download a file from R2 by its object key.
    Used by OCR service to read file contents before processing.
    """
    client = get_r2_client()
    response = client.get_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=object_key,
    )
    return response["Body"].read()


def delete_file(object_key: str) -> None:
    """
    Delete a file from R2 by its object key.
    Called when a document is deleted by the user.
    """
    try:
        client = get_r2_client()
        client.delete_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=object_key,
        )
    except ClientError as e:
        # Log but don't crash — file may already be gone
        print(f"[R2 DELETE ERROR]: {e}")


def get_presigned_url(object_key: str, expires_in: int = 3600) -> str:
    """
    Generate a temporary signed URL to access a private file.
    Default expiry: 1 hour.

    Useful for allowing frontend to display/download files
    without making the bucket fully public.
    """
    client = get_r2_client()
    url = client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.R2_BUCKET_NAME,
            "Key": object_key,
        },
        ExpiresIn=expires_in,
    )
    return url