import httpx
from app.config import settings

async def upload_to_supabase(file_bytes: bytes, filename: str, content_type: str = "application/vnd.openxmlformats-officedocument.wordprocessingml.document") -> str:
    """Upload a file to Supabase Storage and return the public URL."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.")

    url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{filename}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Content-Type": content_type,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, content=file_bytes)
        if resp.status_code not in (200, 201):
            raise Exception(f"Upload failed: {resp.status_code} {resp.text}")

    # Return public URL
    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/{filename}"
    return public_url

async def download_from_supabase(filename: str) -> bytes:
    """Download a file from Supabase Storage by filename."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase not configured.")

    url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{filename}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            raise Exception(f"Download failed: {resp.status_code}")
        return resp.content

async def delete_from_supabase(filename: str) -> None:
    """Delete a file from Supabase Storage."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return

    url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{filename}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}"}

    async with httpx.AsyncClient() as client:
        await client.delete(url, headers=headers)
