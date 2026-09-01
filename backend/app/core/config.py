"""Application configuration settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core settings for the FastAPI application."""

    PROJECT_NAME: str = "Breast Cancer Decision Tree API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS allowlist
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "*",  # Allow all during local development
    ]

    # Model training settings
    RANDOM_SEED: int = 42
    TRAIN_SPLIT_RATIO: float = 0.70

    # Medical Disclaimer
    MEDICAL_DISCLAIMER: str = (
        "Educational Machine Learning Demo Only: Output is not a medical diagnosis "
        "and does not replace clinical consultation, imaging, or laboratory biopsy."
    )

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
