from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from security import get_current_user
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/history", response_model=List[Dict[str, Any]])
def get_portfolio_history(period: str = "1M", current_user: dict = Depends(get_current_user)):
    """
    Get portfolio value history for the growth chart.
    Period options: 1M, 3M, 6M, 1Y, ALL (default: 1M)
    """
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Calculate start date based on period
    start_date = datetime.now() - timedelta(days=30)  # Default 1M
    if period == "3M":
        start_date = datetime.now() - timedelta(days=90)
    elif period == "6M":
        start_date = datetime.now() - timedelta(days=180)
    elif period == "1Y":
        start_date = datetime.now() - timedelta(days=365)
    elif period == "ALL":
        start_date = datetime.min
        
    cur.execute("""
        SELECT date, total_value, total_invested
        FROM portfolio_history
        WHERE user_id = %s AND date >= %s
        ORDER BY date ASC
    """, (current_user["id"], start_date))
    
    history = cur.fetchall()
    
    # If no history, return current state as a single point (today)
    if not history:
        cur.execute("""
            SELECT COALESCE(SUM(current_value), 0) as total_value,
                   COALESCE(SUM(cost_basis), 0) as total_invested
            FROM investments
            WHERE user_id = %s
        """, (current_user["id"],))
        current = cur.fetchone()
        
        # Only return if there's any value
        if current and (current['total_value'] > 0 or current['total_invested'] > 0):
             return [{
                "date": datetime.now().strftime("%Y-%m-%d"),
                "total_value": float(current['total_value']),
                "total_invested": float(current['total_invested'])
            }]
        return []

    cur.close()
    conn.close()
    
    return [
        {
            "date": row["date"].strftime("%Y-%m-%d"),
            "total_value": float(row["total_value"]),
            "total_invested": float(row["total_invested"])
        }
        for row in history
    ]


@router.get("/allocation", response_model=List[Dict[str, Any]])
def get_asset_allocation(current_user: dict = Depends(get_current_user)):
    """Get asset allocation breakdown for the pie chart."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT asset_type, SUM(current_value) as value
        FROM investments
        WHERE user_id = %s
        GROUP BY asset_type
    """, (current_user["id"],))
    
    allocation = cur.fetchall()
    cur.close()
    conn.close()
    
    total_value = sum(float(row["value"]) for row in allocation)
    
    return [
        {
            "name": row["asset_type"].replace('_', ' ').title(),
            "value": float(row["value"]),
            "percent": (float(row["value"]) / total_value * 100) if total_value > 0 else 0
        }
        for row in allocation
    ]


@router.get("/summary", response_model=Dict[str, Any])
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    """Get overall portfolio summary for Invested vs Current chart."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            COALESCE(SUM(cost_basis), 0) as total_invested,
            COALESCE(SUM(current_value), 0) as current_value
        FROM investments
        WHERE user_id = %s
    """, (current_user["id"],))
    
    summary = cur.fetchone()
    cur.close()
    conn.close()
    
    return {
        "invested": float(summary["total_invested"]),
        "current": float(summary["current_value"])
    }


@router.get("/goals-progress", response_model=List[Dict[str, Any]])
def get_goals_progress(current_user: dict = Depends(get_current_user)):
    """Get progress of all active goals based on monthly contributions over time."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id, 
            goal_type, 
            target_amount,
            monthly_contribution,
            target_date,
            status,
            created_at
        FROM goals
        WHERE user_id = %s AND status = 'active'
        ORDER BY target_date ASC
    """, (current_user["id"],))
    
    goals = cur.fetchall()
    cur.close()
    conn.close()
    
    now = datetime.now()
    result = []
    for row in goals:
        target = float(row["target_amount"])
        monthly = float(row["monthly_contribution"]) if row["monthly_contribution"] else 0
        created = row["created_at"] if row["created_at"] else now
        target_date = row["target_date"]
        
        # Calculate months since goal was created
        months_elapsed = max(1, (now.year - created.year) * 12 + (now.month - created.month))
        
        # Estimated current savings = monthly contribution × months elapsed
        current_saved = monthly * months_elapsed
        current_saved = min(current_saved, target)  # Cap at target
        
        percent = (current_saved / target * 100) if target > 0 else 0
        
        # Calculate months remaining until target date
        months_remaining = 0
        if target_date:
            td = target_date if isinstance(target_date, datetime) else datetime.combine(target_date, datetime.min.time())
            months_remaining = max(0, (td.year - now.year) * 12 + (td.month - now.month))
        
        result.append({
            "id": row["id"],
            "name": row["goal_type"].replace('_', ' ').title(),
            "target": target,
            "current": round(current_saved, 2),
            "percent": round(min(percent, 100), 1),
            "monthly_contribution": monthly,
            "target_date": str(target_date) if target_date else None,
            "months_remaining": months_remaining,
            "status": row["status"]
        })
    
    return result
