# Price Service & yfinance Integration

This document explains how the price update system works in the Wealth Management application.

---

## 📁 Files Involved

| File | Purpose |
|------|---------|
| `scheduler.py` | Schedules automated tasks (runs at 1 AM UTC daily) |
| `price_service.py` | Fetches stock prices from yfinance and updates database |

---

## 🔄 How It All Connects

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION STARTUP                            │
│                                                                         │
│   main.py calls start_scheduler()                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SCHEDULER (scheduler.py)                         │
│                                                                         │
│   start_scheduler()                                                     │
│       │                                                                 │
│       └── Schedules price_update_job() to run at 1:00 AM UTC daily     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                          (Every day at 1 AM UTC)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      price_update_job() [scheduler.py]                   │
│                                                                         │
│   - Prints timestamp                                                    │
│   - Calls update_all_investment_prices() from price_service.py         │
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
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 fetch_prices_batch() [PriceService class]                │
│                                                                         │
│   For each symbol:                                                      │
│       1. Check Redis cache first (get_price_from_cache)                 │
│       2. If not cached, fetch from yfinance API                         │
│       3. Cache the result (set_price_in_cache)                          │
│       4. Return price data                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           yfinance API                                   │
│                                                                         │
│   ticker = yf.Ticker("AAPL")                                            │
│   info = ticker.fast_info                                               │
│       - lastPrice (current stock price)                                 │
│       - previousClose (yesterday's closing price)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Function Reference

### scheduler.py

#### `start_scheduler()`
**When called:** Application startup (from main.py)  
**What it does:**
- Creates a BackgroundScheduler instance
- Schedules `price_update_job` to run at 1:00 AM UTC daily
- Starts the scheduler

#### `shutdown_scheduler()`
**When called:** Application shutdown  
**What it does:**
- Stops the scheduler gracefully

#### `price_update_job()`
**When called:** Automatically at 1:00 AM UTC every day  
**What it does:**
- Logs the timestamp
- Calls `update_all_investment_prices()` from price_service.py
- Logs the result

#### `get_scheduler_status()`
**When called:** When you want to check scheduler status  
**What it does:**
- Returns status of scheduler (running/not running)
- Returns list of scheduled jobs with next run times

---

### price_service.py

#### `PriceService` Class

##### `__init__(self)`
- Initializes the service
- Calls `_connect_redis()` to establish Redis connection

##### `_connect_redis(self)`
- Connects to Redis server for caching
- If connection fails, service works without cache (direct API calls)

##### `_get_cache_key(self, symbol)`
- Generates Redis key for a symbol
- Example: "AAPL" → "price:AAPL"

##### `_is_market_hours(self)`
- Checks if US stock market is currently open
- Market hours: 9:30 AM - 4:00 PM ET (weekdays only)
- Used to determine cache TTL (15 min during market, 1 hour otherwise)

##### `get_price_from_cache(self, symbol)`
- Looks up symbol in Redis cache
- Returns cached price data or None

##### `set_price_in_cache(self, symbol, price_data)`
- Stores price data in Redis
- TTL: 15 minutes (market hours) or 1 hour (off hours)

##### `fetch_price(self, symbol, force_refresh=False)`
**The main function for getting a single stock price**

```
fetch_price("AAPL")
        │
        ▼
┌───────────────────┐     Yes    ┌─────────────────┐
│ Check Redis Cache │ ─────────► │ Return Cached   │
└───────────────────┘            │ Price Data      │
        │ No                     └─────────────────┘
        ▼
┌───────────────────┐
│ Call yfinance API │
│ ticker.fast_info  │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Extract:          │
│ - lastPrice       │
│ - previousClose   │
│ - Calculate change│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Cache in Redis    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Return price_data │
└───────────────────┘
```

**Returns:**
```python
{
    "symbol": "AAPL",
    "price": 150.25,
    "previous_close": 148.50,
    "change": 1.75,
    "change_percent": 1.18,
    "updated_at": "2026-02-04T01:00:00"
}
```

##### `fetch_prices_batch(self, symbols)`
- Fetches prices for multiple symbols efficiently
- Uses `yf.Tickers()` for batch API calls
- Checks cache first for each symbol

---

#### `update_all_investment_prices()`
**The main function called by the scheduler**

```
update_all_investment_prices()
        │
        ▼
┌─────────────────────────────────┐
│ Connect to Database             │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ SELECT DISTINCT symbol          │
│ FROM investments                │
│                                 │
│ Gets: ["AAPL", "GOOGL", "MSFT"] │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Create PriceService()           │
│ Call fetch_prices_batch(symbols)│
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ For each symbol with price:     │
│                                 │
│ UPDATE investments              │
│ SET last_price = 150.25,        │
│     current_value = units * 150.25, │
│     last_price_at = NOW()       │
│ WHERE symbol = 'AAPL'           │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Return summary:                 │
│ {"updated": 5, "failed": 0}     │
└─────────────────────────────────┘
```

---

## 💾 Database Updates

When the scheduler runs, it updates the `investments` table:

| Column | What Gets Updated |
|--------|-------------------|
| `last_price` | Latest stock price from yfinance |
| `current_value` | `units × last_price` (total value) |
| `last_price_at` | Current timestamp |

**Example:**
If you have 10 shares of AAPL and the price is $150:
- `last_price` = 150.00
- `current_value` = 10 × 150 = 1500.00
- `last_price_at` = 2026-02-04 01:00:00

---

## 🔴 Redis Caching

Redis is used to avoid hitting the yfinance API too frequently.

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Request    │         │    Redis     │         │   yfinance   │
│  for Price   │────────►│    Cache     │────────►│     API      │
└──────────────┘         └──────────────┘         └──────────────┘
                              │                         │
                    Cache Hit │                         │ Cache Miss
                              ▼                         ▼
                    ┌──────────────┐         ┌──────────────┐
                    │   Return     │         │  Fetch from  │
                    │   Cached     │         │  API & Cache │
                    │   Data       │         │  Result      │
                    └──────────────┘         └──────────────┘
```

**Cache TTL (Time To Live):**
- During market hours: 15 minutes
- Outside market hours: 1 hour

---

## 🕐 Schedule Timing

| Timezone | Time |
|----------|------|
| UTC | 1:00 AM |
| IST (India) | 6:30 AM |
| EST (US East) | 8:00 PM (previous day) |
| PST (US West) | 5:00 PM (previous day) |

---

## 🚀 Manual Trigger

You can manually trigger a price update by calling:

```python
from services.price_service import update_all_investment_prices

result = update_all_investment_prices()
print(result)  # {"updated": 5, "failed": 0}
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
