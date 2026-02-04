

from services.price_service import update_all_investment_prices

if __name__ == "__main__":
    print("Starting manual price update...")
    result = update_all_investment_prices()
    print(f"\nResult: {result}")
