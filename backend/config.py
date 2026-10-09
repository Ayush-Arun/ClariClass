import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clariclass.db")
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "temporary-secret-key-for-clariclass-mvp")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    OTP_EXPIRE_SECONDS: int = int(os.getenv("OTP_EXPIRE_SECONDS", 300))
    OTP_DEV_BYPASS: bool = os.getenv("OTP_DEV_BYPASS", "true").lower() == "true"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMMA_MODEL_NAME: str = os.getenv("GEMMA_MODEL_NAME", "gemma-4-it")
    
    DEFAULT_STRUGGLE_THRESHOLD_PERCENT: float = float(os.getenv("DEFAULT_STRUGGLE_THRESHOLD_PERCENT", 25.0))
    DEFAULT_MIN_STUDENTS_FOR_THRESHOLD: int = int(os.getenv("DEFAULT_MIN_STUDENTS_FOR_THRESHOLD", 3))

settings = Settings()
