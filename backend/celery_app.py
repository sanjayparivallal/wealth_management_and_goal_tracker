import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

# Get Redis URL from environment variable or default to local
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "wealth_manager",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["services.scheduler"]  # Ensure tasks are discovered
)

# Optional: Configure Celery settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "daily-price-update": {
            "task": "daily_price_update",
            "schedule": crontab(hour=12, minute=30),  # 12:30 UTC = 18:00 IST
        },
    },
)

if __name__ == "__main__":
    celery_app.start()
