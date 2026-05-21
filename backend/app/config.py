import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Database Settings
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@localhost:5432/recommender")

    # Redis Settings
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # JWT Authentication Settings
    JWT_SECRET: str = Field(default="supersecretjwtkeyforrecommendersystem123!")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440) # 24 hours

    # Server Settings
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    # ML Recommendation Engine Settings
    MODEL_DIR: str = Field(default="ml/models")
    RECOMMENDATION_CACHE_TTL: int = Field(default=3600) # 1 hour

    # Configuration loading from root .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate singleton settings
settings = Settings()
