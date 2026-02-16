
import sys
import os
import random
from datetime import datetime, timedelta
import json
import traceback

# Add parent directory to path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db_connection

def seed_real_data():
    conn = get_db_connection()
    cur = conn.cursor()

    users_data = [
        {"email": "sanjayparivallal@gmail.com", "name": "Sanjay Parivallal", "profile": "aggressive"},
        {"email": "user1@gmail.com", "name": "Conservative User", "profile": "conservative"},
        {"email": "user2@gmail.com", "name": "Aggressive User", "profile": "aggressive"},
        {"email": "user3@gmail.com", "name": "Moderate User", "profile": "moderate"},
        {"email": "test_dashboard_v1@example.com", "name": "Test Dashboard User", "profile": "moderate"},
    ]

    print("🌱 Starting comprehensive data seeding...")

    try:
        # --- 0. RISK QUESTIONS (Global) ---
        print("   Seeding risk questions...")
        cur.execute("DELETE FROM risk_questions")
        questions = [
            ("What is your investment horizon?", "Less than 3 years", "3-10 years", "More than 10 years", 1, 3, 5),
            ("How do you react to market drops?", "Sell immediately", "Hold and wait", "Buy more", 1, 3, 5),
            ("What is your primary goal?", "Preserve capital", "Steady growth", "Maximize returns", 1, 3, 5),
            ("What percentage of income can you save?", "Less than 10%", "10-25%", "More than 25%", 1, 3, 5),
            ("How familiar are you with investing?", "Beginner", "Intermediate", "Expert", 1, 3, 5),
        ]
        for q, o1, o2, o3, s1, s2, s3 in questions:
            cur.execute("""
                INSERT INTO risk_questions (question, option1, option2, option3, option1_score, option2_score, option3_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (q, o1, o2, o3, s1, s2, s3))
        conn.commit()


        for user_info in users_data:
            try:
                email = user_info["email"]
                name = user_info["name"]
                profile = user_info["profile"]
                
                # Check/Create User
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                user = cur.fetchone()
                
                if not user:
                    print(f"Creating user {email}...")
                    cur.execute("""
                        INSERT INTO users (name, email, password, risk_profile, kyc_status, profile_completed)
                        VALUES (%s, %s, %s, %s, 'verified', TRUE)
                        RETURNING id
                    """, (name, email, "password123", profile))
                    user_id = cur.fetchone()['id']
                else:
                    user_id = user['id']
                    cur.execute("UPDATE users SET risk_profile = %s WHERE id = %s", (profile, user_id))
                
                conn.commit()
                print(f"👤 Seeding data for {name} (ID: {user_id})...")

                # --- 1. GOALS ---
                cur.execute("DELETE FROM goals WHERE user_id = %s", (user_id,))
                
                goals = []
                if profile == "aggressive":
                    goals = [("retirement", 5000000, 25, 20000), ("custom", 1000000, 5, 15000)]
                elif profile == "conservative":
                    goals = [("retirement", 2000000, 15, 10000), ("education", 500000, 8, 5000)]
                else:
                    goals = [("home", 3000000, 10, 15000), ("retirement", 4000000, 30, 10000)]

                goal_ids = []
                for g_type, amt, years, contrib in goals:
                    target_date = (datetime.now() + timedelta(days=365*years)).strftime("%Y-%m-%d")
                    cur.execute("""
                        INSERT INTO goals (user_id, goal_type, target_amount, target_date, monthly_contribution, status)
                        VALUES (%s, %s, %s, %s, %s, 'active')
                        RETURNING id
                    """, (user_id, g_type, amt, target_date, contrib))
                    goal_ids.append(cur.fetchone()['id'])
                conn.commit()

                # --- 2. TRANSACTIONS & HISTORY ---
                cur.execute("DELETE FROM transactions WHERE user_id = %s", (user_id,))
                cur.execute("DELETE FROM investments WHERE user_id = %s", (user_id,))
                cur.execute("DELETE FROM portfolio_history WHERE user_id = %s", (user_id,))
                cur.execute("DELETE FROM simulations WHERE user_id = %s", (user_id,))
                conn.commit()

                # Assets
                assets_map = {
                    "aggressive": [("stock", "TSLA", 150, 400), ("stock", "NVDA", 400, 950), ("etf", "QQQ", 300, 450)],
                    "conservative": [("bond", "BND", 70, 75), ("etf", "VTI", 200, 270)],
                    "moderate": [("etf", "SPY", 400, 530), ("stock", "AAPL", 130, 190)]
                }
                selected_assets = assets_map.get(profile, assets_map["moderate"])
                
                current_portfolio = {} 
                history_records = []
                start_date = datetime.now() - timedelta(days=365)
                
                # Generate History
                for day_offset in range(366):
                    current_date = start_date + timedelta(days=day_offset)
                    date_str = current_date.strftime("%Y-%m-%d")
                    
                    if random.random() < 0.1:
                        asset = random.choice(selected_assets)
                        atype, symbol, min_p, max_p = asset
                        price = round(random.uniform(min_p, max_p), 2)
                        
                        qty = random.randint(1, 5)
                        fees = round(qty * price * 0.001, 2)
                        
                        cur.execute("""
                            INSERT INTO transactions (user_id, symbol, type, quantity, price, fees, executed_at)
                            VALUES (%s, %s, 'buy', %s, %s, %s, %s)
                        """, (user_id, symbol, qty, price, fees, current_date))
                        
                        if symbol not in current_portfolio:
                            current_portfolio[symbol] = {'units': 0, 'cost_basis': 0, 'type': atype}
                        current_portfolio[symbol]['units'] += qty
                        current_portfolio[symbol]['cost_basis'] += (qty * price) + fees

                    # Snapshots
                    total_val = 0
                    total_inv = 0
                    for sym, data in current_portfolio.items():
                        if data['units'] > 0:
                            price = 100 
                            for a in selected_assets:
                                if a[1] == sym:
                                    price = a[2]
                                    break
                            total_val += data['units'] * price
                            total_inv += data['cost_basis']
                    
                    if total_val > 0:
                         history_records.append((user_id, date_str, total_val, total_inv))

                # Insert History
                for rec in history_records:
                     cur.execute("""
                        INSERT INTO portfolio_history (user_id, date, total_value, total_invested)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (user_id, date) DO NOTHING
                    """, rec)
                conn.commit()

                # --- 3. INVESTMENTS ---
                for i, (sym, data) in enumerate(current_portfolio.items()):
                    if data['units'] > 0:
                        for a in selected_assets:
                            if a[1] == sym:
                                    _, _, min_p, max_p = a
                                    break
                        price = max_p
                        cur_val = data['units'] * price
                        avg_buy = data['cost_basis'] / data['units']
                        goal_id = goal_ids[i % len(goal_ids)] if goal_ids else None
                        
                        cur.execute("""
                            INSERT INTO investments 
                            (user_id, asset_type, symbol, units, avg_buy_price, cost_basis, current_value, last_price, last_price_at, goal_id)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s)
                        """, (user_id, data['type'], sym, data['units'], avg_buy, data['cost_basis'], cur_val, price, goal_id))
                conn.commit()

                 # --- 4. RECOMMENDATIONS ---
                cur.execute("DELETE FROM recommendations WHERE user_id = %s", (user_id,))
                recs = [("Portfolio Rebalancing", "Your portfolio is drifting from your target allocation."), ("Emergency Fund", "Ensure you have liquid savings.")]
                for title, text in recs:
                    cur.execute("""
                        INSERT INTO recommendations (user_id, title, recommendation_text, suggested_allocation)
                        VALUES (%s, %s, %s, %s)
                    """, (user_id, title, text, json.dumps({"stock": 60, "bond": 40})))
                conn.commit()

                # --- 5. SIMULATIONS ---
                if goal_ids:
                    cur.execute("""
                        INSERT INTO simulations (user_id, goal_id, scenario_name, assumptions, results)
                        VALUES (%s, %s, 'Retirement Upside', %s, %s)
                    """, (user_id, goal_ids[0], json.dumps({"return_rate": 0.08}), json.dumps({"projected_amount": 1000000})))
                conn.commit()

                print(f"   ✅ Seeded full dataset for {name}.")

            except Exception as xe:
                print(f"❌ Error for user {user_info.get('email')}: {xe}")
                conn.rollback()
                continue

    except Exception as e:
        print(f"❌ Fatal Error: {e}")
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_real_data()
