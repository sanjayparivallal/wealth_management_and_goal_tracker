import sys
import os
import random
from datetime import datetime, timedelta

# Add parent directory to path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db_connection

def seed_real_data():
    conn = get_db_connection()
    cur = conn.cursor()

    users_data = [
        {"email": "sanjayparivallal@gmail.com", "profile": "aggressive"},
        {"email": "user1@gmail.com", "profile": "conservative"},
        {"email": "user2@gmail.com", "profile": "aggressive"},
        {"email": "user3@gmail.com", "profile": "moderate"},
        {"email": "user4@gmail.com", "profile": "moderate"},
        {"email": "test@example.com", "profile": "moderate"},
        {"email": "test2@example.com", "profile": "moderate"},
    ]

    print("Starting data seeding...")

    try:
        for user_info in users_data:
            cur.execute("SELECT id, name FROM users WHERE email = %s", (user_info["email"],))
            user = cur.fetchone()

            if not user:
                print(f"User {user_info['email']} not found. Skipping.")
                continue

            user_id = user["id"]
            name = user["name"]
            profile = user_info["profile"]
            print(f"Seeding data for {name} ({profile})...")

            # --- 1. SEED GOALS ---
            # Clear existing goals
            cur.execute("DELETE FROM goals WHERE user_id = %s", (user_id,))
            
            goals = []
            if profile == "aggressive":
                goals = [
                    ("retirement", 5000000, "2050-01-01", 20000, "active"),
                    ("custom", 1000000, "2028-06-01", 15000, "active"), # Startup Fund
                ]
            elif profile == "conservative":
                goals = [
                    ("retirement", 2000000, "2040-01-01", 10000, "active"),
                    ("education", 500000, "2030-01-01", 5000, "active"),
                ]
            else: # Moderate
                goals = [
                    ("home", 3000000, "2032-01-01", 15000, "active"),
                    ("retirement", 4000000, "2055-01-01", 10000, "active"),
                ]

            for g_type, amt, date, contrib, status in goals:
                cur.execute("""
                    INSERT INTO goals (user_id, goal_type, target_amount, target_date, monthly_contribution, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, g_type, amt, date, contrib, status))
            
            print(f"   Added {len(goals)} goals.")


            # --- 2. SEED TRANSACTIONS & INVESTMENTS ---
            # Clear existing
            cur.execute("DELETE FROM transactions WHERE user_id = %s", (user_id,))
            cur.execute("DELETE FROM investments WHERE user_id = %s", (user_id,))

            transactions = []
            # Define some stocks/ETFs
            stocks = {
                "aggressive": [
                    ("stock", "TSLA", 200.0, 250.0),
                    ("stock", "NVDA", 400.0, 900.0),
                    ("etf", "QQQ", 300.0, 450.0),
                    ("stock", "AMD", 80.0, 180.0)
                ],
                "conservative": [
                    ("bond", "BND", 70.0, 72.0),
                    ("etf", "VTI", 200.0, 260.0),
                    ("stock", "KO", 50.0, 60.0),
                    ("stock", "JNJ", 150.0, 160.0)
                ],
                "moderate": [
                    ("etf", "SPY", 400.0, 520.0),
                    ("stock", "AAPL", 150.0, 180.0),
                    ("stock", "MSFT", 300.0, 420.0),
                    ("etf", "VOO", 350.0, 480.0)
                ]
            }

            selected_assets = stocks[profile]
            
            for asset_type, symbol, min_price, max_price in selected_assets:
                # Create 5-8 transactions per asset (buy & sell)
                num_tx = random.randint(5, 8)
                
                current_units = 0
                total_cost_basis = 0
                
                for _ in range(num_tx):
                    date_offset = random.randint(1, 365)
                    executed_at = datetime.now() - timedelta(days=date_offset)
                    price = round(random.uniform(min_price, max_price), 2)
                    
                    # Decide buy or sell
                    # Force buy if we have no units, otherwise 70% chance to buy
                    is_buy = True
                    if current_units > 0 and random.random() > 0.7:
                        is_buy = False
                    
                    if is_buy:
                        qty = random.randint(1, 10)  # Integer units
                        fees = round(qty * price * 0.001, 2)
                        
                        cur.execute("""
                            INSERT INTO transactions (user_id, symbol, type, quantity, price, fees, executed_at)
                            VALUES (%s, %s, 'buy', %s, %s, %s, %s)
                        """, (user_id, symbol, qty, price, fees, executed_at))

                        current_units += qty
                        total_cost_basis += (qty * price) + fees
                    else:
                        # Sell logic
                        qty = random.randint(1, current_units) # Sell partial or all
                        fees = round(qty * price * 0.001, 2)
                        
                        cur.execute("""
                            INSERT INTO transactions (user_id, symbol, type, quantity, price, fees, executed_at)
                            VALUES (%s, %s, 'sell', %s, %s, %s, %s)
                        """, (user_id, symbol, qty, price, fees, executed_at))

                        # Reduce cost basis proportionally
                        cost_basis_sold = (qty / current_units) * total_cost_basis
                        total_cost_basis -= cost_basis_sold
                        current_units -= qty

                # Only create investment if units remain greater than 0
                if current_units > 0:
                    avg_price = total_cost_basis / current_units
                    current_market_price = round(random.uniform(min_price, max_price), 2)
                    current_value = current_units * current_market_price

                    cur.execute("""
                        INSERT INTO investments 
                        (user_id, asset_type, symbol, units, avg_buy_price, cost_basis, current_value, last_price, last_price_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    """, (user_id, asset_type, symbol, current_units, avg_price, total_cost_basis, current_value, current_market_price))

            print(f"   Added transactions (buy/sell) and investments for {len(selected_assets)} assets.")

        conn.commit()
        print("\nDatabase seeding completed successfully!")

    except Exception as e:
        print(f"\nError seeding data: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_real_data()
