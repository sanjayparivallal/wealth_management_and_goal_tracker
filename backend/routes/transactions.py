from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from schema import TransactionCreate
from security import get_current_user
from typing import List

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[dict])
def get_transactions(current_user: dict = Depends(get_current_user)):
    """Get all transactions for the current user"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id,
            symbol,
            type,
            quantity,
            price,
            fees,
            executed_at
        FROM transactions
        WHERE user_id = %s
        ORDER BY executed_at DESC
    """, (current_user["id"],))
    
    transactions = cur.fetchall()
    cur.close()
    conn.close()
    
    return transactions


@router.get("/summary")
def get_transaction_summary(current_user: dict = Depends(get_current_user)):
    """Get transaction summary statistics"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            COUNT(*) as total_transactions,
            SUM(CASE WHEN type = 'buy' THEN quantity * price ELSE 0 END) as total_bought,
            SUM(CASE WHEN type = 'sell' THEN quantity * price ELSE 0 END) as total_sold,
            SUM(fees) as total_fees
        FROM transactions
        WHERE user_id = %s
    """, (current_user["id"],))
    
    summary = cur.fetchone()
    cur.close()
    conn.close()
    
    return summary


@router.post("", response_model=dict)
def create_transaction(transaction: TransactionCreate, current_user: dict = Depends(get_current_user)):
    """
    Record a new transaction and automatically update the investment portfolio.
    
    Logic:
    - BUY: Increase units and cost basis (average cost). If new symbol, create investment.
    - SELL: Decrease units and cost basis. If units reach 0, remove investment? (For now, keep with 0 units or delete).
    """
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 1. Record the Transaction
        # NOTE: Cloud DB 'transactions' table does NOT have 'asset_type'. 
        # We accept it in the payload for Investment logic, but don't save it to transactions history.
        cur.execute("""
            INSERT INTO transactions 
            (user_id, symbol, type, quantity, price, fees, executed_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            RETURNING id, symbol, type, quantity, price, fees, executed_at
        """, (
            current_user["id"],
            transaction.symbol,
            transaction.type,
            transaction.quantity,
            transaction.price,
            transaction.fees
        ))
        
        new_transaction = cur.fetchone()
        
        # 2. Update Investment Portfolio
        # Check if investment exists
        cur.execute("""
            SELECT id, units, cost_basis, avg_buy_price FROM investments 
            WHERE user_id = %s AND symbol = %s
        """, (current_user["id"], transaction.symbol))
        
        existing_invest = cur.fetchone()
        
        total_cost = (transaction.quantity * transaction.price) + transaction.fees
        
        if transaction.type == 'buy':
            if existing_invest:
                new_units = float(existing_invest['units']) + transaction.quantity
                new_cost_basis = float(existing_invest['cost_basis']) + total_cost
                new_avg_price = new_cost_basis / new_units if new_units > 0 else 0
                
                cur.execute("""
                    UPDATE investments 
                    SET units = %s, cost_basis = %s, avg_buy_price = %s, current_value = %s, last_price = %s, last_price_at = NOW()
                    WHERE id = %s
                """, (
                    new_units, 
                    new_cost_basis, 
                    new_avg_price, 
                    new_units * transaction.price, # Approx current value based on last transaction price
                    transaction.price,
                    existing_invest['id']
                ))
            else:
                # Create new investment
                # We use the asset_type provided in the request payload
                cur.execute("""
                    INSERT INTO investments
                    (user_id, asset_type, symbol, units, avg_buy_price, cost_basis, current_value, last_price, last_price_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """, (
                    current_user["id"],
                    transaction.asset_type.value,
                    transaction.symbol,
                    transaction.quantity,
                    transaction.price,      # avg_buy_price
                    total_cost,             # cost_basis
                    transaction.quantity * transaction.price,  # current_value
                    transaction.price       # last_price
                ))
                
        elif transaction.type == 'sell':
            if not existing_invest:
                raise HTTPException(status_code=400, detail=f"You don't own any {transaction.symbol} to sell")
            
            # Reduce units
            current_units = float(existing_invest['units'])
            
            if current_units >= transaction.quantity:
                new_units = current_units - transaction.quantity
                
                # Cost basis reduction (Proportional)
                # Sold portion of cost basis = (Sold Qty / Total Qty) * Total Cost Basis
                cost_basis_sold = (transaction.quantity / current_units) * float(existing_invest['cost_basis'])
                new_cost_basis = float(existing_invest['cost_basis']) - cost_basis_sold
                
                cur.execute("""
                    UPDATE investments 
                    SET units = %s, cost_basis = %s, current_value = %s, last_price = %s, last_price_at = NOW()
                    WHERE id = %s
                """, (
                    new_units, 
                    new_cost_basis, 
                    new_units * transaction.price, 
                    transaction.price,
                    existing_invest['id']
                ))
                
                # Delete investment if units become 0
                if new_units == 0:
                    cur.execute("DELETE FROM investments WHERE id = %s", (existing_invest['id'],))
            else:
                # User selling more than they have? 
                # Allow it but warn? Or block? 
                # For simple app, allow negative units? Or throw error?
                # Let's throw error for data integrity
                raise HTTPException(status_code=400, detail="Insufficient units to sell")
            
        conn.commit()
        cur.close()
        conn.close()
        
        # Add asset_type manually to response for frontend consistency (even if not in DB)
        response = dict(new_transaction)
        response['asset_type'] = transaction.asset_type.value
        return response
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
