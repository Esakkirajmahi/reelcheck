import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    UPLOAD_DIR: str = "uploads"
    DATA_DIR: str = "data/jobs"
    MAX_FILE_SIZE_MB: int = 100
    MAX_FRAMES: int = 10

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.DATA_DIR, exist_ok=True)
