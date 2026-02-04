"""
Price Service - Fetches and caches stock prices using yfinance and Redis.

Features:
- Fetches real-time prices from Yahoo Finance
- Caches prices in Redis (15-minute TTL during market hours)
- Batch updates all investments in the database
- Designed for scheduled execution (1 AM daily)
"""

import yfinance as yf
import redis
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from dotenv import load_dotenv

load_dotenv()

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# Cache TTL in seconds (15 minutes for market hours, 1 hour otherwise)
CACHE_TTL_MARKET = 900  # 15 minutes
CACHE_TTL_OFF_HOURS = 3600  # 1 hour


class PriceService:
    """Service for fetching and caching stock prices."""
    
    def __init__(self):
        self.redis_client = None
        self._connect_redis()
    
    def _connect_redis(self):
        """Initialize Redis connection."""
        try:
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                password=REDIS_PASSWORD,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            print("✅ Redis connected successfully")
        except redis.ConnectionError as e:
            print(f"⚠️ Redis connection failed: {e}. Falling back to direct API calls.")
            self.redis_client = None
    
    def _get_cache_key(self, symbol: str) -> str:
        """Generate cache key for a symbol."""
        return f"price:{symbol.upper()}"
    
    def _is_market_hours(self) -> bool:
        """Check if US stock market is open (simplified check)."""
        now = datetime.utcnow()
        # Market hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
        # Weekdays only
        if now.weekday() >= 5:  # Saturday or Sunday
            return False
        hour = now.hour
        return 14 <= hour < 21
    
    def get_price_from_cache(self, symbol: str) -> Optional[Dict]:
        """Get cached price data for a symbol."""
        if not self.redis_client:
            return None
        
        try:
            cached = self.redis_client.get(self._get_cache_key(symbol))
            if cached:
                return json.loads(cached)
        except redis.RedisError as e:
            print(f"Redis error getting cache: {e}")
        
        return None
    
    def set_price_in_cache(self, symbol: str, price_data: Dict) -> bool:
        """Cache price data for a symbol."""
        if not self.redis_client:
            return False
        
        try:
            ttl = CACHE_TTL_MARKET if self._is_market_hours() else CACHE_TTL_OFF_HOURS
            self.redis_client.setex(
                self._get_cache_key(symbol),
                ttl,
                json.dumps(price_data)
            )
            return True
        except redis.RedisError as e:
            print(f"Redis error setting cache: {e}")
            return False
    
    def fetch_price(self, symbol: str, force_refresh: bool = False) -> Optional[Dict]:
        """
        Fetch current price for a symbol.
        Checks cache first, then falls back to yfinance API.
        
        Returns:
            Dict with keys: price, previous_close, change, change_percent, updated_at
        """
        # Check cache first (unless force refresh)
        if not force_refresh:
            cached = self.get_price_from_cache(symbol)
            if cached:
                print(f"📦 Cache hit for {symbol}")
                return cached
        
        # Fetch from yfinance
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info
            
            current_price = info.get('lastPrice') or info.get('regularMarketPrice')
            previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose')
            
            if current_price is None:
                # Try getting from history as fallback
                hist = ticker.history(period="1d")
                if not hist.empty:
                    current_price = float(hist['Close'].iloc[-1])
                    previous_close = float(hist['Open'].iloc[0]) if previous_close is None else previous_close
            
            if current_price is None:
                print(f"❌ No price data available for {symbol}")
                return None
            
            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0
            
            price_data = {
                "symbol": symbol.upper(),
                "price": round(current_price, 2),
                "previous_close": round(previous_close, 2) if previous_close else None,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Cache the result
            self.set_price_in_cache(symbol, price_data)
            print(f"🌐 Fetched price for {symbol}: ${price_data['price']}")
            
            return price_data
            
        except Exception as e:
            print(f"❌ Error fetching price for {symbol}: {e}")
            return None
    
    def fetch_prices_batch(self, symbols: List[str]) -> Dict[str, Optional[Dict]]:
        """
        Fetch prices for multiple symbols.
        Uses batch download for efficiency.
        
        Returns:
            Dict mapping symbol -> price_data
        """
        results = {}
        symbols_to_fetch = []
        
        # Check cache first
        for symbol in symbols:
            cached = self.get_price_from_cache(symbol)
            if cached:
                results[symbol.upper()] = cached
            else:
                symbols_to_fetch.append(symbol)
        
        if not symbols_to_fetch:
            return results
        
        # Batch fetch remaining symbols
        try:
            tickers = yf.Tickers(" ".join(symbols_to_fetch))
            
            for symbol in symbols_to_fetch:
                try:
                    ticker = tickers.tickers.get(symbol.upper())
                    if ticker:
                        info = ticker.fast_info
                        current_price = info.get('lastPrice') or info.get('regularMarketPrice')
                        previous_close = info.get('previousClose')
                        
                        if current_price:
                            change = current_price - previous_close if previous_close else 0
                            change_percent = (change / previous_close * 100) if previous_close else 0
                            
                            price_data = {
                                "symbol": symbol.upper(),
                                "price": round(current_price, 2),
                                "previous_close": round(previous_close, 2) if previous_close else None,
                                "change": round(change, 2),
                                "change_percent": round(change_percent, 2),
                                "updated_at": datetime.utcnow().isoformat()
                            }
                            
                            self.set_price_in_cache(symbol, price_data)
                            results[symbol.upper()] = price_data
                        else:
                            results[symbol.upper()] = None
                    else:
                        results[symbol.upper()] = None
                except Exception as e:
                    print(f"Error fetching {symbol}: {e}")
                    results[symbol.upper()] = None
                    
        except Exception as e:
            print(f"Batch fetch error: {e}")
            # Fall back to individual fetches
            for symbol in symbols_to_fetch:
                results[symbol.upper()] = self.fetch_price(symbol)
        
        return results


def update_all_investment_prices():
    """
    Update current_value and last_price for all investments in the database.
    This function is designed to be called by the scheduler at 1 AM.
    """
    from database import get_db_connection
    
    print(f"\n{'='*50}")
    print(f"🕐 Starting price update at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}\n")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get all unique symbols from investments
    cur.execute("SELECT DISTINCT symbol FROM investments")
    symbols = [row['symbol'] for row in cur.fetchall()]
    
    if not symbols:
        print("No investments found to update.")
        cur.close()
        conn.close()
        return {"updated": 0, "failed": 0}
    
    print(f"📊 Found {len(symbols)} unique symbols to update")
    
    # Fetch all prices
    price_service = PriceService()
    prices = price_service.fetch_prices_batch(symbols)
    
    updated_count = 0
    failed_count = 0
    
    # Update each investment
    for symbol, price_data in prices.items():
        if price_data and price_data.get('price'):
            try:
                # Update all investments with this symbol
                cur.execute("""
                    UPDATE investments
                    SET last_price = %s,
                        current_value = units * %s,
                        last_price_at = NOW()
                    WHERE UPPER(symbol) = %s
                """, (price_data['price'], price_data['price'], symbol.upper()))
                
                rows_affected = cur.rowcount
                updated_count += rows_affected
                print(f"✅ Updated {symbol}: ${price_data['price']} ({rows_affected} investments)")
                
            except Exception as e:
                print(f"❌ Error updating {symbol}: {e}")
                failed_count += 1
        else:
            print(f"⚠️ No price data for {symbol}")
            failed_count += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"\n{'='*50}")
    print(f"✅ Price update complete: {updated_count} updated, {failed_count} failed")
    print(f"{'='*50}\n")
    
    return {"updated": updated_count, "failed": failed_count}


# Singleton instance
_price_service: Optional[PriceService] = None


def get_price_service() -> PriceService:
    """Get or create the price service singleton."""
    global _price_service
    if _price_service is None:
        _price_service = PriceService()
    return _price_service
