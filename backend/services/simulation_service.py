from datetime import datetime
from typing import List, Dict, Any
import math

class SimulationService:
    def __init__(self):
        pass

    def run_simulation(self, assumptions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run a financial simulation based on assumptions.
        
        Args:
            assumptions: {
                "initial_amount": float,
                "monthly_contribution": float,
                "time_horizon_years": int,
                "expected_return_rate": float (percentage, e.g., 7.5),
                "inflation_rate": float (percentage, e.g., 3.0)
            }
            
        Returns:
            Dict containing comparison results and monthly data points.
        """
        initial_amount = float(assumptions.get("initial_amount", 0))
        monthly_contribution = float(assumptions.get("monthly_contribution", 0))
        years = int(assumptions.get("time_horizon_years", 10))
        return_rate = float(assumptions.get("expected_return_rate", 7.0)) / 100
        inflation_rate = float(assumptions.get("inflation_rate", 3.0)) / 100
        
        months = years * 12
        monthly_return_rate = return_rate / 12
        monthly_inflation_rate = inflation_rate / 12
        
        # Initialize data points
        data_points = []
        
        # Trackers
        current_nominal_balance = initial_amount
        current_real_balance = initial_amount  # Inflation adjusted
        total_invested = initial_amount
        
        # Year 0 point
        data_points.append({
            "month": 0,
            "year": 0,
            "invested": round(total_invested, 2),
            "nominal_value": round(current_nominal_balance, 2),
            "real_value": round(current_real_balance, 2)
        })
        
        for m in range(1, months + 1):
            # 1. Apply monthly growth
            interest = current_nominal_balance * monthly_return_rate
            current_nominal_balance += interest
            
            # 2. Add contribution
            current_nominal_balance += monthly_contribution
            total_invested += monthly_contribution
            
            # 3. Calculate Real Value (Discounting back to present value)
            # Formula: Nominal / (1 + inflation)^years_passed
            years_passed = m / 12
            discount_factor = (1 + inflation_rate) ** years_passed
            current_real_balance = current_nominal_balance / discount_factor
            
            # Record data point (annually or final month to save space, but frontend might want all)
            # Let's simple return annual points to keep JSON small, plus the final month
            if m % 12 == 0:
                data_points.append({
                    "month": m,
                    "year": int(m / 12),
                    "invested": round(total_invested, 2),
                    "nominal_value": round(current_nominal_balance, 2),
                    "real_value": round(current_real_balance, 2)
                })
                
        # Calculate summary stats
        nominal_gain = current_nominal_balance - total_invested
        real_gain = current_real_balance - total_invested
        
        return {
            "summary": {
                "years": years,
                "total_invested": round(total_invested, 2),
                "future_value_nominal": round(current_nominal_balance, 2),
                "future_value_real": round(current_real_balance, 2),
                "nominal_gain": round(nominal_gain, 2),
                "real_gain": round(real_gain, 2),
                "purchasing_power_loss": round(current_nominal_balance - current_real_balance, 2)
            },
            "chart_data": data_points
        }
