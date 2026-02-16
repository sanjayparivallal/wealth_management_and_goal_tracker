"""
Seed script for Wealth Management & Goal Tracker.

Key principle: Investments are NEVER inserted directly.
They are created/updated ONLY as a side effect of processing buy/sell transactions,
mirroring the exact logic in routes/transactions.py.

Usage:
    cd backend
    python -m seed.seed_real_data
"""

import psycopg2
import psycopg2.extras
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random

load_dotenv()


def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", "5432"),
        cursor_factory=psycopg2.extras.RealDictCursor
    )


# ─── Existing User IDs (do NOT re-insert users) ────────────────────────────
USER_IDS = [1, 2, 3, 5, 7]

# Users reference (for context only — not inserted):
# ID 1: sanjay c p    | aggressive   | verified   | profile_completed=True
# ID 2: user1         | conservative | verified   | profile_completed=True
# ID 3: user2         | aggressive   | verified   | profile_completed=True
# ID 5: user3         | moderate     | unverified | profile_completed=False
# ID 7: user4         | moderate     | unverified | profile_completed=True


# ─── GOALS DATA ─────────────────────────────────────────────────────────────
GOALS_DATA = {
    1: [  # sanjay — aggressive investor
        ("retirement", 500000, "2050-01-01", 2000, "active"),
        ("home", 150000, "2030-06-15", 3500, "active"),
        ("education", 80000, "2032-09-01", 1500, "active"),
        ("custom", 25000, "2027-12-31", 1000, "active"),
    ],
    2: [  # user1 — conservative
        ("retirement", 300000, "2055-01-01", 1000, "active"),
        ("home", 200000, "2035-03-01", 2000, "active"),
        ("education", 50000, "2033-08-01", 800, "paused"),
    ],
    3: [  # user2 — aggressive
        ("retirement", 750000, "2048-01-01", 3000, "active"),
        ("custom", 40000, "2028-06-30", 2500, "active"),
        ("home", 250000, "2031-12-01", 4000, "active"),
    ],
    5: [  # user3 — moderate (profile not completed, but goals can exist)
        ("retirement", 400000, "2052-01-01", 1500, "active"),
        ("education", 60000, "2034-05-01", 900, "active"),
    ],
    7: [  # user4 — moderate
        ("retirement", 350000, "2050-07-01", 1200, "active"),
        ("home", 180000, "2033-01-01", 2500, "active"),
        ("custom", 15000, "2027-03-31", 600, "completed"),
    ],
}


# ─── TRANSACTION DATA ────────────────────────────────────────────────────────
# Format: (symbol, type, asset_type, quantity, price, fees, days_ago)
# days_ago = how many days before today the transaction was executed
# asset_type is used for investment creation, NOT stored in transactions table

TRANSACTIONS_DATA = {
    1: [  # sanjay — aggressive, heavy tech & crypto
        # First batch of buys (older)
        ("AAPL", "buy", "stock", 15, 178.50, 4.99, 90),
        ("GOOGL", "buy", "stock", 8, 141.20, 4.99, 88),
        ("TSLA", "buy", "stock", 12, 245.30, 4.99, 85),
        ("AMZN", "buy", "stock", 10, 185.60, 4.99, 82),
        ("MSFT", "buy", "stock", 20, 378.90, 4.99, 80),
        ("NVDA", "buy", "stock", 6, 875.40, 4.99, 75),
        ("VOO", "buy", "etf", 25, 452.10, 0, 70),
        ("BND", "buy", "bond", 30, 72.50, 0, 68),

        # Second batch — adding to positions
        ("AAPL", "buy", "stock", 10, 182.30, 4.99, 45),
        ("TSLA", "buy", "stock", 5, 260.10, 4.99, 40),
        ("NVDA", "buy", "stock", 4, 920.50, 4.99, 35),

        # Sells
        ("GOOGL", "sell", "stock", 3, 155.80, 4.99, 20),
        ("TSLA", "sell", "stock", 7, 270.00, 4.99, 15),
        ("BND", "sell", "bond", 10, 73.80, 0, 10),

        # Recent buys
        ("META", "buy", "stock", 8, 505.20, 4.99, 7),
        ("QQQ", "buy", "etf", 12, 498.30, 0, 5),
        ("AMZN", "buy", "stock", 5, 192.40, 4.99, 3),
    ],

    2: [  # user1 — conservative, bonds & ETFs heavy
        ("BND", "buy", "bond", 50, 71.90, 0, 95),
        ("AGG", "buy", "bond", 40, 99.80, 0, 92),
        ("VOO", "buy", "etf", 15, 448.50, 0, 88),
        ("VTI", "buy", "etf", 20, 235.60, 0, 85),
        ("SCHD", "buy", "etf", 30, 78.40, 0, 80),
        ("AAPL", "buy", "stock", 5, 175.20, 4.99, 75),
        ("JNJ", "buy", "stock", 10, 156.30, 4.99, 70),
        ("PG", "buy", "stock", 8, 162.40, 4.99, 65),

        # Small additions
        ("BND", "buy", "bond", 20, 72.10, 0, 40),
        ("VOO", "buy", "etf", 10, 455.20, 0, 30),

        # Conservative sell — taking some profit
        ("SCHD", "sell", "etf", 10, 81.20, 0, 15),
        ("PG", "sell", "stock", 3, 168.50, 4.99, 8),
    ],

    3: [  # user2 — aggressive, growth & tech focused
        ("NVDA", "buy", "stock", 10, 850.00, 4.99, 100),
        ("AMD", "buy", "stock", 25, 168.40, 4.99, 95),
        ("TSLA", "buy", "stock", 20, 240.00, 4.99, 90),
        ("PLTR", "buy", "stock", 50, 22.50, 4.99, 88),
        ("SOFI", "buy", "stock", 100, 8.90, 4.99, 85),
        ("COIN", "buy", "stock", 12, 225.60, 4.99, 80),
        ("ARKK", "buy", "etf", 35, 48.20, 0, 75),
        ("SQ", "buy", "stock", 15, 78.90, 4.99, 70),

        # Adding to winners
        ("NVDA", "buy", "stock", 5, 910.00, 4.99, 50),
        ("PLTR", "buy", "stock", 30, 25.80, 4.99, 45),
        ("AMD", "buy", "stock", 10, 175.60, 4.99, 40),

        # Taking profits on some
        ("TSLA", "sell", "stock", 10, 275.00, 4.99, 25),
        ("SOFI", "sell", "stock", 40, 11.20, 4.99, 20),
        ("COIN", "sell", "stock", 5, 260.40, 4.99, 12),

        # Recent momentum plays
        ("SMCI", "buy", "stock", 8, 780.00, 4.99, 6),
        ("MSTR", "buy", "stock", 5, 1450.00, 4.99, 4),
    ],

    5: [  # user3 — moderate, balanced mix
        ("VOO", "buy", "etf", 20, 450.00, 0, 85),
        ("VTI", "buy", "etf", 15, 233.80, 0, 82),
        ("AAPL", "buy", "stock", 10, 180.00, 4.99, 78),
        ("MSFT", "buy", "stock", 8, 375.40, 4.99, 75),
        ("BND", "buy", "bond", 25, 72.00, 0, 70),
        ("GLD", "buy", "etf", 10, 195.20, 0, 65),

        # Small addition
        ("VOO", "buy", "etf", 5, 458.00, 0, 30),

        # One sell
        ("GLD", "sell", "etf", 5, 200.10, 0, 12),
    ],

    7: [  # user4 — moderate, dividend & value focused
        ("KO", "buy", "stock", 30, 59.80, 4.99, 92),
        ("PEP", "buy", "stock", 20, 172.50, 4.99, 88),
        ("WMT", "buy", "stock", 15, 165.30, 4.99, 85),
        ("JPM", "buy", "stock", 10, 195.60, 4.99, 80),
        ("V", "buy", "stock", 8, 280.40, 4.99, 76),
        ("SCHD", "buy", "etf", 40, 77.90, 0, 72),
        ("VYM", "buy", "etf", 25, 112.30, 0, 68),
        ("BND", "buy", "bond", 35, 71.80, 0, 64),

        # Second buys
        ("KO", "buy", "stock", 15, 61.20, 4.99, 38),
        ("JPM", "buy", "stock", 5, 200.80, 4.99, 30),
        ("SCHD", "buy", "etf", 15, 79.50, 0, 22),

        # Some profit taking
        ("PEP", "sell", "stock", 8, 178.90, 4.99, 14),
        ("V", "sell", "stock", 3, 290.50, 4.99, 7),
    ],
}


# ─── RECOMMENDATIONS DATA ────────────────────────────────────────────────────
RECOMMENDATIONS_DATA = {
    1: [
        ("Increase Tech Exposure",
         "Given your aggressive risk profile, consider adding more high-growth tech positions. NVDA and META show strong momentum with AI tailwinds.",
         {"stocks": 60, "etfs": 25, "bonds": 10, "cash": 5}),
        ("Rebalance Bond Allocation",
         "Your bond position (BND) is higher than recommended for an aggressive profile. Consider shifting 5-10% into growth ETFs like QQQ.",
         {"stocks": 65, "etfs": 25, "bonds": 5, "cash": 5}),
    ],
    2: [
        ("Strengthen Fixed Income",
         "As a conservative investor, increasing your AGG and BND positions will provide stable income and reduce portfolio volatility.",
         {"stocks": 20, "etfs": 30, "bonds": 40, "cash": 10}),
        ("Add Dividend Aristocrats",
         "Consider adding dividend-paying stocks like JNJ and PG for steady income alongside your bond holdings.",
         {"stocks": 25, "etfs": 30, "bonds": 35, "cash": 10}),
        ("Emergency Fund Check",
         "Ensure you maintain 6-12 months of expenses in cash or short-term bonds before further equity investments.",
         {"stocks": 20, "etfs": 25, "bonds": 40, "cash": 15}),
    ],
    3: [
        ("Diversify Away from Single Stocks",
         "Your portfolio is heavily concentrated in individual growth stocks. Adding broad-market ETFs would reduce single-stock risk.",
         {"stocks": 55, "etfs": 30, "bonds": 10, "cash": 5}),
        ("Consider Hedging Strategies",
         "With significant NVDA and TSLA exposure, protective puts or collar strategies could limit downside risk during market corrections.",
         {"stocks": 60, "etfs": 25, "bonds": 10, "cash": 5}),
    ],
    5: [
        ("Well-Balanced Portfolio",
         "Your current mix of ETFs, stocks, and bonds aligns well with a moderate risk profile. Continue dollar-cost averaging into VOO and VTI.",
         {"stocks": 35, "etfs": 35, "bonds": 25, "cash": 5}),
    ],
    7: [
        ("Optimize Dividend Yield",
         "Your dividend-focused strategy is solid. Consider adding JEPI or JEPQ for enhanced income from covered call premiums.",
         {"stocks": 35, "etfs": 35, "bonds": 20, "cash": 10}),
        ("Tax-Efficient Positioning",
         "Place high-dividend positions in tax-advantaged accounts. Consider municipal bonds for taxable accounts to improve after-tax returns.",
         {"stocks": 30, "etfs": 35, "bonds": 25, "cash": 10}),
    ],
}


# ─── RISK QUESTIONS ──────────────────────────────────────────────────────────
RISK_QUESTIONS = [
    {
        "question": "How would you react if your investment portfolio dropped 20% in a single month?",
        "option1": "Sell everything immediately", "option1_score": 2,
        "option2": "Hold and wait for recovery", "option2_score": 6,
        "option3": "Buy more at lower prices", "option3_score": 10,
    },
    {
        "question": "What is your primary investment goal?",
        "option1": "Preserve capital and minimize risk", "option1_score": 2,
        "option2": "Balanced growth with moderate risk", "option2_score": 6,
        "option3": "Maximize returns, willing to take high risk", "option3_score": 10,
    },
    {
        "question": "How long do you plan to keep your investments before needing the money?",
        "option1": "Less than 3 years", "option1_score": 2,
        "option2": "3-10 years", "option2_score": 6,
        "option3": "More than 10 years", "option3_score": 10,
    },
    {
        "question": "What percentage of your monthly income can you afford to invest?",
        "option1": "Less than 10%", "option1_score": 2,
        "option2": "10-30%", "option2_score": 6,
        "option3": "More than 30%", "option3_score": 10,
    },
    {
        "question": "How experienced are you with investing?",
        "option1": "Beginner — I'm just starting out", "option1_score": 2,
        "option2": "Intermediate — I understand the basics", "option2_score": 6,
        "option3": "Advanced — I actively manage my portfolio", "option3_score": 10,
    },
]


# ─── HELPER: Process a transaction and update investments ─────────────────────
def process_transaction(cur, user_id, symbol, tx_type, asset_type, quantity, price, fees, executed_at):
    """
    Mirrors the EXACT logic from routes/transactions.py:
    1. Insert transaction record
    2. Create/update investment based on buy/sell
    """
    # 1. Insert transaction (asset_type is NOT stored in transactions table)
    cur.execute("""
        INSERT INTO transactions (user_id, symbol, type, quantity, price, fees, executed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (user_id, symbol, tx_type, quantity, price, fees, executed_at))

    # 2. Check existing investment
    cur.execute("""
        SELECT id, units, cost_basis, avg_buy_price
        FROM investments
        WHERE user_id = %s AND symbol = %s
    """, (user_id, symbol))
    existing = cur.fetchone()

    total_cost = (quantity * price) + fees

    if tx_type == "buy":
        if existing:
            new_units = float(existing["units"]) + quantity
            new_cost_basis = float(existing["cost_basis"]) + total_cost
            new_avg_price = new_cost_basis / new_units if new_units > 0 else 0

            cur.execute("""
                UPDATE investments
                SET units = %s, cost_basis = %s, avg_buy_price = %s,
                    current_value = %s, last_price = %s, last_price_at = %s
                WHERE id = %s
            """, (
                new_units, new_cost_basis, new_avg_price,
                new_units * price, price, executed_at,
                existing["id"]
            ))
        else:
            cur.execute("""
                INSERT INTO investments
                (user_id, asset_type, symbol, units, avg_buy_price, cost_basis,
                 current_value, last_price, last_price_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id, asset_type, symbol,
                quantity, price, total_cost,
                quantity * price, price, executed_at
            ))

    elif tx_type == "sell":
        if existing:
            current_units = float(existing["units"])
            if current_units >= quantity:
                new_units = current_units - quantity
                # Proportional cost basis reduction
                cost_basis_sold = (quantity / current_units) * float(existing["cost_basis"])
                new_cost_basis = float(existing["cost_basis"]) - cost_basis_sold

                cur.execute("""
                    UPDATE investments
                    SET units = %s, cost_basis = %s,
                        current_value = %s, last_price = %s, last_price_at = %s
                    WHERE id = %s
                """, (
                    new_units, new_cost_basis,
                    new_units * price, price, executed_at,
                    existing["id"]
                ))

                if new_units == 0:
                    cur.execute("DELETE FROM investments WHERE id = %s", (existing["id"],))


# ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────
def seed():
    conn = get_db_connection()
    cur = conn.cursor()
    now = datetime.now()

    try:
        print("🗑️  Clearing existing seed data (keeping users)...")
        cur.execute("DELETE FROM portfolio_history")
        cur.execute("DELETE FROM simulations")
        cur.execute("DELETE FROM recommendations")
        cur.execute("DELETE FROM transactions")
        cur.execute("DELETE FROM investments")
        cur.execute("DELETE FROM goals")
        cur.execute("DELETE FROM risk_questions")
        conn.commit()
        print("   ✅ Cleared!")

        # ── Risk Questions ──────────────────────────────────────────────
        print("\n📝 Seeding risk questions...")
        for q in RISK_QUESTIONS:
            cur.execute("""
                INSERT INTO risk_questions
                (question, option1, option2, option3, option1_score, option2_score, option3_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                q["question"],
                q["option1"], q["option2"], q["option3"],
                q["option1_score"], q["option2_score"], q["option3_score"]
            ))
        conn.commit()
        print(f"   ✅ {len(RISK_QUESTIONS)} risk questions seeded")

        # ── Goals ────────────────────────────────────────────────────────
        print("\n🎯 Seeding goals...")
        total_goals = 0
        for user_id, goals in GOALS_DATA.items():
            for goal_type, target, deadline, monthly, status in goals:
                cur.execute("""
                    INSERT INTO goals
                    (user_id, goal_type, target_amount, target_date, monthly_contribution, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, goal_type, target, deadline, monthly, status))
                total_goals += 1
        conn.commit()
        print(f"   ✅ {total_goals} goals seeded across {len(GOALS_DATA)} users")

        # ── Transactions & Investments ───────────────────────────────────
        print("\n💸 Seeding transactions (investments created automatically)...")
        total_tx = 0
        for user_id, transactions in TRANSACTIONS_DATA.items():
            for symbol, tx_type, asset_type, qty, price, fees, days_ago in transactions:
                executed_at = now - timedelta(days=days_ago, hours=random.randint(0, 12), minutes=random.randint(0, 59))
                process_transaction(cur, user_id, symbol, tx_type, asset_type, qty, price, fees, executed_at)
                total_tx += 1
        conn.commit()

        # Count resulting investments
        cur.execute("SELECT COUNT(*) as cnt FROM investments")
        inv_count = cur.fetchone()["cnt"]
        print(f"   ✅ {total_tx} transactions processed → {inv_count} investment positions created")

        # ── Portfolio History ─────────────────────────────────────────────
        HISTORY_DAYS = 120  # Cover full transaction range (oldest tx is ~100 days ago)
        print(f"\n📈 Seeding portfolio history ({HISTORY_DAYS} days)...")
        total_snapshots = 0
        for user_id in USER_IDS:
            # Get user's total investment value
            cur.execute("""
                SELECT COALESCE(SUM(current_value), 0) as total_value,
                       COALESCE(SUM(cost_basis), 0) as total_invested
                FROM investments WHERE user_id = %s
            """, (user_id,))
            inv_data = cur.fetchone()
            base_value = float(inv_data["total_value"]) if inv_data["total_value"] else 0
            base_invested = float(inv_data["total_invested"]) if inv_data["total_invested"] else 0

            if base_value == 0:
                continue

            # Get user's earliest transaction date to know when portfolio started
            cur.execute("""
                SELECT MIN(executed_at) as first_tx
                FROM transactions WHERE user_id = %s
            """, (user_id,))
            first_tx_row = cur.fetchone()
            first_tx_date = first_tx_row["first_tx"].date() if first_tx_row and first_tx_row["first_tx"] else (now - timedelta(days=HISTORY_DAYS)).date()

            for day in range(HISTORY_DAYS, 0, -1):
                snapshot_date = (now - timedelta(days=day)).date()

                # Skip days before user's first transaction
                if snapshot_date < first_tx_date:
                    continue

                # Portfolio ramp-up: gradually build from ~30% to 100% of current value
                days_since_start = (snapshot_date - first_tx_date).days
                total_span = max((now.date() - first_tx_date).days, 1)
                progress = min(days_since_start / total_span, 1.0)

                # S-curve ramp for more realistic portfolio building
                ramp = 0.3 + 0.7 * progress  # starts at 30%, ends at 100%
                daily_noise = random.uniform(-0.012, 0.018)  # daily variance
                daily_value = base_value * (ramp + daily_noise)
                daily_invested = base_invested * (0.3 + 0.7 * progress)

                cur.execute("""
                    INSERT INTO portfolio_history (user_id, date, total_value, total_invested)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (user_id, date) DO NOTHING
                """, (user_id, snapshot_date, round(daily_value, 2), round(daily_invested, 2)))
                total_snapshots += 1
        conn.commit()
        print(f"   ✅ {total_snapshots} portfolio history snapshots seeded")

        # ── Recommendations ──────────────────────────────────────────────
        print("\n💡 Seeding recommendations...")
        total_recs = 0
        for user_id, recs in RECOMMENDATIONS_DATA.items():
            for title, text, allocation in recs:
                cur.execute("""
                    INSERT INTO recommendations
                    (user_id, title, recommendation_text, suggested_allocation)
                    VALUES (%s, %s, %s, %s)
                """, (user_id, title, text, json.dumps(allocation)))
                total_recs += 1
        conn.commit()
        print(f"   ✅ {total_recs} recommendations seeded")

        # ── Summary ──────────────────────────────────────────────────────
        print("\n" + "=" * 55)
        print("🎉 SEED COMPLETE!")
        print("=" * 55)
        print(f"   Risk Questions : {len(RISK_QUESTIONS)}")
        print(f"   Goals          : {total_goals}")
        print(f"   Transactions   : {total_tx}")
        print(f"   Investments    : {inv_count} (created from transactions)")
        print(f"   History Points : {total_snapshots}")
        print(f"   Recommendations: {total_recs}")
        print("=" * 55)

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed()
