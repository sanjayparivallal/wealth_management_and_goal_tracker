from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from schema import InvestmentCreate
from security import get_current_user
from services.price_service import get_price_service, update_all_investment_prices
from services.scheduler import get_scheduler_status, trigger_price_update_now
from typing import List

router = APIRouter(prefix="/investments", tags=["investments"])


@router.get("", response_model=List[dict])
def get_investments(current_user: dict = Depends(get_current_user)):
    """Get all investments for the current user"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id,
            asset_type,
            symbol,
            units,
            avg_buy_price,
            cost_basis,
            current_value,
            last_price,
            last_price_at
        FROM investments
        WHERE user_id = %s
        ORDER BY symbol
    """, (current_user["id"],))
    
    investments = cur.fetchall()
    cur.close()
    conn.close()
    
    return investments


@router.get("/summary")
def get_investment_summary(current_user: dict = Depends(get_current_user)):
    """Get investment portfolio summary"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            COUNT(*) as total_investments,
            SUM(cost_basis) as total_invested,
            SUM(current_value) as total_value,
            SUM(current_value - cost_basis) as total_gain_loss
        FROM investments
        WHERE user_id = %s
    """, (current_user["id"],))
    
    summary = cur.fetchone()
    cur.close()
    conn.close()
    
    return summary


@router.post("", response_model=dict)
def create_investment(investment: InvestmentCreate, current_user: dict = Depends(get_current_user)):
    """Add a new investment"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO investments 
        (user_id, asset_type, symbol, units, avg_buy_price, cost_basis, current_value, last_price, last_price_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        RETURNING id, asset_type, symbol, units, avg_buy_price, cost_basis, current_value, last_price, last_price_at
    """, (
        current_user["id"],
        investment.asset_type,
        investment.symbol,
        investment.units,
        investment.avg_buy_price,
        investment.cost_basis,
        investment.current_value,
        investment.last_price
    ))
    
    new_investment = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return new_investment


@router.put("/{investment_id}", response_model=dict)
def update_investment(investment_id: int, investment: InvestmentCreate, current_user: dict = Depends(get_current_user)):
    """Update an existing investment"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Verify investment belongs to user
    cur.execute("SELECT id FROM investments WHERE id = %s AND user_id = %s", (investment_id, current_user["id"]))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Investment not found")
    
    cur.execute("""
        UPDATE investments
        SET asset_type = %s,
            symbol = %s,
            units = %s,
            avg_buy_price = %s,
            cost_basis = %s,
            current_value = %s,
            last_price = %s,
            last_price_at = NOW()
        WHERE id = %s AND user_id = %s
        RETURNING id, asset_type, symbol, units, avg_buy_price, cost_basis, current_value, last_price, last_price_at
    """, (
        investment.asset_type,
        investment.symbol,
        investment.units,
        investment.avg_buy_price,
        investment.cost_basis,
        investment.current_value,
        investment.last_price,
        investment_id,
        current_user["id"]
    ))
    
    updated_investment = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return updated_investment


# ==================== PRICE UPDATE ENDPOINTS ====================

@router.get("/price/{symbol}")
def get_stock_price(symbol: str, current_user: dict = Depends(get_current_user)):
    """Get current price for a stock symbol from yfinance (with Redis caching)"""
    price_service = get_price_service()
    price_data = price_service.fetch_price(symbol)
    
    if not price_data:
        raise HTTPException(status_code=404, detail=f"Could not fetch price for symbol: {symbol}")
    
    return price_data


@router.post("/refresh-prices")
def refresh_all_prices(current_user: dict = Depends(get_current_user)):
    """
    Manually trigger a price refresh for all investments.
    Updates current_value and last_price for all investments in the database.
    """
    result = update_all_investment_prices()
    return {
        "message": "Price refresh completed",
        "updated": result["updated"],
        "failed": result["failed"]
    }


@router.get("/scheduler/status")
def get_price_scheduler_status(current_user: dict = Depends(get_current_user)):
    """Get the status of the price update scheduler"""
    return get_scheduler_status()



