# Price Service & yfinance Integration

This document explains how the price update system works in the Wealth Management application.

---

## 📁 Files Involved

| File | Purpose |
|------|---------|
| `backend/celery_app.py` | Defines the schedule (runs at 6:00 PM IST daily) |
| `backend/services/scheduler.py` | Contains the task logic that Celery executes |
| `backend/services/price_service.py` | Fetches stock prices from yfinance and updates database |

---

## 🔄 How It All Connects

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM STARTUP                                │
│                                                                         │
│   User runs start_services.bat                                          │
│   (Starts Redis + Celery Worker with Beat)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CELERY BEAT (The Clock)                         │
│                                                                         │
│   Checks schedule in celery_app.py                                      │
│   "It's 6:00 PM IST! Time to wake up!"                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                          (Every day at 12:30 UTC / 6:00 PM IST)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      price_update_task() [scheduler.py]                  │
│                                                                         │
│   - Prints timestamp                                                    │
│   - Calls update_all_investment_prices() from price_service.py         │
│   - Logs the result to the console window                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              update_all_investment_prices() [price_service.py]           │
│                                                                         │
│   1. Gets all unique symbols from investments table                     │
│   2. Creates PriceService instance                                      │
│   3. Calls fetch_prices_batch(symbols)                                  │
│   4. Updates database with new prices                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Function Reference

### celery_app.py
**The Brain 🧠**
- Configures the `daily-price-update` schedule.
- Uses Redis as the message broker.

### services/scheduler.py
**The Muscle 💪**
- Defines the `@celery_app.task` that actually gets executed.

### services/price_service.py
**The Logic ⚙️**
- Connects to `yfinance` to fetch real-time data.
- Caches results in Redis to be fast and efficient.
- Updates your `investments` table in PostgreSQL.

---

## 🕐 Schedule Timing

| Timezone | Time |
|----------|------|
| UTC | 12:30 PM |
| **IST (India)** | **6:00 PM** |

---

## 🚀 Manual Trigger

You can manually trigger a price update at any time by running:

```bash
python backend/scripts/manual_price_update.py
```

Or for a single symbol:

```python
from services.price_service import get_price_service

service = get_price_service()
price = service.fetch_price("AAPL")
print(price)
# {
#     "symbol": "AAPL",
#     "price": 150.25,
#     "previous_close": 148.50,
#     "change": 1.75,
#     "change_percent": 1.18,
#     "updated_at": "2026-02-04T01:00:00"
# }
```

---

## 📊 Complete Flow Summary

```
1. App starts
   └── main.py calls start_scheduler()

2. Every day at 1 AM UTC
   └── Scheduler triggers price_update_job()
       └── Calls update_all_investment_prices()
           └── Gets all symbols from database
           └── Creates PriceService
           └── Calls fetch_prices_batch(symbols)
               └── For each symbol:
                   └── Check Redis cache
                   └── If not cached → Call yfinance API
                   └── Cache the result
                   └── Return price data
           └── Update database with new prices
               └── last_price = new price
               └── current_value = units × price
               └── last_price_at = NOW()

3. App shutdown
   └── main.py calls shutdown_scheduler()
```
