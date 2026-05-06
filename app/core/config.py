from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "EdoHERMA ComplianceWatch"
    environment: str = "development"

    secret_key: str = "change_this_secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str

    production_unlocked: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


# ✅ THIS LINE IS MANDATORY
settings = Settings()