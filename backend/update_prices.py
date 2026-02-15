
import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from services.price_service import update_all_investment_prices
    
    if __name__ == "__main__":
        print("Starting manual price update...")
        result = update_all_investment_prices()
        print(f"\nResult: {result}")
except ImportError as e:
    print(f"Error: {e}")
    print("Run this script from the 'backend' folder using: python update_prices.py")
