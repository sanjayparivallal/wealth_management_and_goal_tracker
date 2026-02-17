from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from security import get_current_user
from typing import Dict, List, Any
from enum import Enum

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

# 1. Define Asset Allocation Strategy
# Percentages should add up to 100 for each profile
ALLOCATION_STRATEGIES = {
    "conservative": {
        "equity": 20,
        "debt": 60,
        "cash": 20
    },
    "moderate": {
        "equity": 50,
        "debt": 40,
        "cash": 10
    },
    "aggressive": {
        "equity": 80,
        "debt": 15,
        "cash": 5
    }
}

ASSET_CATEGORY_MAPPING = {
    "stock": "equity",
    "etf": "equity",
    "mutual_fund": "equity",
    "bond": "debt",
    "cash": "cash"
}

@router.get("", response_model=Dict[str, Any])
def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Get investment recommendations and rebalancing suggestions based on user's risk profile.
    """
    user_id = current_user["id"]
    risk_profile = current_user.get("risk_profile", "moderate") # Default to moderate if not set (though it should be)
    
    # normalize risk profile string
    if not risk_profile:
        risk_profile = "moderate"
    risk_profile = risk_profile.lower()

    if risk_profile not in ALLOCATION_STRATEGIES:
         # Fallback or error, but let's default to moderate for safety
         risk_profile = "moderate"

    target_allocation = ALLOCATION_STRATEGIES[risk_profile]

    # 3. Calculate Current Portfolio Allocation
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT asset_type, current_value 
        FROM investments 
        WHERE user_id = %s
    """, (user_id,))
    
    investments = cur.fetchall()
    cur.close()
    conn.close()

    total_portfolio_value = sum(float(inv["current_value"]) for inv in investments)
    
    current_allocation_value = {
        "equity": 0.0,
        "debt": 0.0,
        "cash": 0.0
    }

    for inv in investments:
        asset_type = inv["asset_type"]
        value = float(inv["current_value"])
        category = ASSET_CATEGORY_MAPPING.get(asset_type, "equity") # Default to equity if unknown
        if category in current_allocation_value:
            current_allocation_value[category] += value

    current_allocation_pct = {
        "equity": 0.0,
        "debt": 0.0,
        "cash": 0.0
    }

    if total_portfolio_value > 0:
        for category, value in current_allocation_value.items():
            current_allocation_pct[category] = round((value / total_portfolio_value) * 100, 2)
    else:
        # If no investments, current allocation is 0, but we can't really rebalance.
        # We can still return recommendations.
        pass

    # 4. Build Rebalancing Logic
    suggestions = []
    
    # Threshold for suggesting a rebalance (e.g. if deviation is > 5%)
    THRESHOLD = 5.0
    
    if total_portfolio_value > 0:
        for category, target_pct in target_allocation.items():
            current_pct = current_allocation_pct.get(category, 0)
            diff = current_pct - target_pct

            # If diff is positive, we are overweight (Reduce)
            # If diff is negative, we are underweight (Increase)

            if abs(diff) >= THRESHOLD:
                action = "Reduce" if diff > 0 else "Increase"
                # Calculate absolute value to move to get back to target
                target_amount = total_portfolio_value * (target_pct / 100)
                current_amount = current_allocation_value[category]
                change_amount = abs(target_amount - current_amount)

                suggestions.append({
                    "category": category,
                    "action": action,
                    "message": f"{action} {category.capitalize()} exposure by {abs(round(diff, 1))}% (approx. ₹{round(change_amount, 2)})",
                    "reasoning": f"Current: {current_pct}%, Target: {target_pct}%, Amount to move: ₹{round(change_amount, 2)}"
                })
    else:
        suggestions.append({
            "category": "General",
            "action": "Invest",
            "message": "Start investing to build your portfolio according to the recommended allocation.",
            "reasoning": "Portfolio is empty."
        })

    return {
        "risk_profile": risk_profile,
        "target_allocation": target_allocation,
        "current_allocation": current_allocation_pct,
        "total_portfolio_value": total_portfolio_value,
        "suggestions": suggestions
    }
