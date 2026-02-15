# 🧠 Detailed Code Walkthrough: Price Update System

This document explains **every single line of code** involved in the automated price update system.

---

## 1. `backend/celery_app.py`
**Purpose:** This is the "Configuration Center". It sets up the Celery worker and the schedule.

```python
import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()  # 1. Loads environment variables from .env file (like REDIS_URL)

# 2. Get Redis URL. If not found in .env, default to local port 6379, db 0.
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# 3. Create the Celery Application Instance
celery_app = Celery(
    "wealth_manager",               # Name of the app
    broker=REDIS_URL,               # Where to SEND messages (Redis)
    backend=REDIS_URL,              # Where to STORE results (Redis)
    include=["services.scheduler"]  # IMPORTANT: Tells Celery where to look for tasks!
)

# 4. Configure settings
celery_app.conf.update(
    task_serializer="json",         # Send data as JSON
    accept_content=["json"],        # Only accept JSON
    result_serializer="json",       # Return results as JSON
    timezone="UTC",                 # Internal clock is UTC
    enable_utc=True,
    
    # 5. THE SCHEDULE (Celery Beat)
    beat_schedule={
        "daily-price-update": {     # Name of the schedule entry
            "task": "daily_price_update",           # Name of the task to run
            "schedule": crontab(hour=12, minute=30) # time to run (12:30 UTC = 6:00 PM IST)
        },
    },
)

if __name__ == "__main__":
    celery_app.start()              # Starts the app if run directly
```

---

## 2. `backend/services/scheduler.py`
**Purpose:** This is the "Task Definition". It defines *what* happens when the schedule triggers.

```python
from celery_app import celery_app
from datetime import datetime
import logging

# 1. Setup Logging (so we can see output in the terminal)
logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# 2. Define the Task
# @celery_app.task turns a normal function into a Celery task
# name="daily_price_update" MUST match the name in celery_app.py beat_schedule
@celery_app.task(name="daily_price_update")
def price_update_task():
    """Celery task to update all investment prices."""
    
    # 3. Log that we started
    logger.info(f"🔔 Celery task: Price update triggered at {datetime.now()}")
    
    try:
        # 4. Import the actual logic inside the function 
        # (Importing inside avoids circular dependency issues)
        from services.price_service import update_all_investment_prices
        
        # 5. Run the logic!
        result = update_all_investment_prices()
        
        # 6. Log success
        logger.info(f"📈 Price update result: {result}")
        return result
        
    except Exception as e:
        # 7. Log failure if something breaks
        logger.error(f"❌ Price update failed: {e}")
        raise e

# 8. Helper function for manual triggering (optional)
def trigger_price_update_now():
    logger.info("🔄 Manual price update triggered via Celery")
    price_update_task.delay()  # .delay() sends it to Redis immediately
```

---

## 3. `backend/services/price_service.py`
**Purpose:** This is the "Logic Core". It does the heavy lifting of fetching and updating.

### The Main Function: `update_all_investment_prices`

```python
def update_all_investment_prices():
    from database import get_db_connection
    
    # 1. Start clean
    print(f"🕐 Starting price update...")
    
    # 2. Connect to PostgreSQL
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 3. Find out what stocks we own
    # "SELECT DISTINCT symbol" ensures we only check AAPL once, even if 10 users own it.
    cur.execute("SELECT DISTINCT symbol FROM investments")
    symbols = [row['symbol'] for row in cur.fetchall()]
    
    # 4. Safety check: Exit if DB is empty
    if not symbols:
        return {"updated": 0, "failed": 0}
    
    # 5. Initialize the PriceService (connects to Redis)
    price_service = PriceService()
    
    # 6. Fetch prices for ALL symbols in one go (Batch)
    # This calls yfinance.Tickers(...) internally
    prices = price_service.fetch_prices_batch(symbols)
    
    # 7. Loop through results and update Database
    for symbol, price_data in prices.items():
        if price_data:
            # SQL Update:
            # - updates 'last_price'
            # - recalculates 'current_value' (units * price)
            # - updates 'last_price_at' timestamp
            cur.execute("""
                UPDATE investments
                SET last_price = %s,
                    current_value = units * %s,
                    last_price_at = NOW()
                WHERE UPPER(symbol) = %s
            """, (price_data['price'], price_data['price'], symbol.upper()))
            
    # 8. Commit (Save) changes to DB
    conn.commit()
    conn.close()
    
    return {"updated": updated_count, "failed": failed_count}
```

### The `PriceService` Class

```python
class PriceService:
    def __init__(self):
        self._connect_redis() # Connects to Redis on startup

    def fetch_prices_batch(self, symbols):
        # 1. Check Redis Cache first (Super fast)
        # If we have the price in Redis, use it!
        
        # 2. Identify missing symbols (Cache Misses)
        
        # 3. Fetch missing symbols from yfinance
        # yf.Tickers("AAPL GOOGL MSFT") downloads all at once
        
        # 4. Save new data to Redis (for next time)
        # self.set_price_in_cache(symbol, data)
        
        return results
```

---

## 🔑 Key Concepts Explained

### Why Redis?
- **Speed:** Reading from Redis takes **milliseconds**. Reading from Yahoo Finance takes **seconds**.
- **Limits:** Yahoo Finance might block you if you ask too often. Redis prevents this.
- **Broker:** Redis acts as the mailbox between the Scheduler (Sender) and Worker (Receiver).

### Why Celery?
- **Async:** It runs in the background. Your main API (`main.py`) doesn't freeze while prices are updating.
- **Reliable:** If the task fails, Celery can retry it.
- **Scheduled:** It handles the complex timing ("Every day at 6 PM") perfectly.
