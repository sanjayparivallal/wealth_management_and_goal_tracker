import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

# Load environment variables FIRST
load_dotenv()


from psycopg2 import pool

# Global pool variable
pg_pool = None

def init_db_pool():
    """Initialize the database connection pool."""
    global pg_pool
    if pg_pool is None:
        try:
            database_url = os.getenv("DATABASE_URL")
            if database_url:
                pg_pool = pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=20,
                    dsn=database_url,
                    cursor_factory=RealDictCursor
                )
            else:
                pg_pool = pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=20,
                    host=os.getenv("DB_HOST"),
                    port=os.getenv("DB_PORT"),
                    database=os.getenv("DB_NAME"),
                    user=os.getenv("DB_USER"),
                    password=os.getenv("DB_PASSWORD"),
                    sslmode=os.getenv("DB_SSLMODE", "prefer"),
                    cursor_factory=RealDictCursor
                )
            print("✅ Database connection pool initialized")
        except Exception as e:
            print(f"❌ Error initializing database pool: {e}")
            raise e

def close_db_pool():
    """Close all connections in the pool."""
    global pg_pool
    if pg_pool:
        pg_pool.closeall()
        print("✅ Database connection pool closed")


class ConnectionWrapper:
    """
    Wraps a psycopg2 connection to intercept .close() calls.
    Instead of closing the connection, it returns it to the pool.
    """
    def __init__(self, conn, pool):
        self.conn = conn
        self.pool = pool

    def close(self):
        """Return connection to the pool instead of closing it."""
        if self.conn and self.pool:
            self.pool.putconn(self.conn)
            self.conn = None

    def __getattr__(self, name):
        """Delegate all other attribute access to the underlying connection."""
        return getattr(self.conn, name)


def get_db_connection():
    """
    Get a connection from the global pool.
    Returns a ConnectionWrapper that puts the connection back in the pool on .close().
    """
    global pg_pool
    if not pg_pool:
        # Fallback if pool is not initialized (e.g. scripts)
        init_db_pool()
    
    conn = pg_pool.getconn()
    return ConnectionWrapper(conn, pg_pool)


def create_tables():
    """
    Create database tables for the Wealth Management API.
    This is for local/dev usage.
    Production DB already exists.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Users table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        risk_profile VARCHAR(20)
            CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive'))
            DEFAULT 'moderate',
        kyc_status VARCHAR(20)
            CHECK (kyc_status IN ('unverified', 'verified'))
            DEFAULT 'unverified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 🔹 ADD REQUIRED NEW COLUMNS (SAFE)
    cur.execute("""
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
    """)

    # Goals table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(20)
            CHECK (goal_type IN ('retirement', 'home', 'education', 'custom')) NOT NULL,
        target_amount NUMERIC NOT NULL,
        target_date DATE NOT NULL,
        monthly_contribution NUMERIC NOT NULL,
        status VARCHAR(20)
            CHECK (status IN ('active', 'paused', 'completed'))
            DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Investments table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        asset_type VARCHAR(20)
            CHECK (asset_type IN ('stock', 'etf', 'mutual_fund', 'bond', 'cash')) NOT NULL,
        symbol VARCHAR(20) NOT NULL,
        units NUMERIC NOT NULL,
        avg_buy_price NUMERIC NOT NULL,
        cost_basis NUMERIC NOT NULL,
        current_value NUMERIC,
        last_price NUMERIC,
        last_price_at TIMESTAMP,
        CONSTRAINT unique_user_symbol UNIQUE (user_id, symbol)
    );
    """)

    # Transactions table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(20) NOT NULL,
        type VARCHAR(20)
            CHECK (type IN ('buy', 'sell', 'dividend', 'contribution', 'withdrawal')) NOT NULL,
        quantity NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        fees NUMERIC DEFAULT 0,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Recommendations table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        recommendation_text TEXT NOT NULL,
        suggested_allocation JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Simulations table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS simulations (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        goal_id INT REFERENCES goals(id) ON DELETE SET NULL,
        scenario_name VARCHAR(100) NOT NULL,
        assumptions JSONB NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Risk Questions table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS risk_questions (
        id SERIAL PRIMARY KEY,
        question VARCHAR(255) NOT NULL,
        option1 VARCHAR(100) NOT NULL,
        option2 VARCHAR(100) NOT NULL,
        option3 VARCHAR(100) NOT NULL,
        option1_score INTEGER NOT NULL,
        option2_score INTEGER NOT NULL,
        option3_score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Portfolio History table (New)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS portfolio_history (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_value NUMERIC NOT NULL,
        total_invested NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
    );
    """)

    # Add goal_id to investments if not exists
    cur.execute("""
    ALTER TABLE investments
    ADD COLUMN IF NOT EXISTS goal_id INT REFERENCES goals(id) ON DELETE SET NULL;
    """)

    conn.commit()
    cur.close()
    conn.close()
