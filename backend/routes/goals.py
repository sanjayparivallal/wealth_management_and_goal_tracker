from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from schema import GoalCreate, GoalResponse, GoalStatus
from security import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=List[dict])
def get_goals(current_user: dict = Depends(get_current_user)):
    """Get all goals for the current user"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id,
            goal_type,
            target_amount,
            target_date,
            monthly_contribution,
            status,
            created_at
        FROM goals
        WHERE user_id = %s
        ORDER BY created_at DESC
    """, (current_user["id"],))
    
    goals = cur.fetchall()
    cur.close()
    conn.close()
    
    return goals


@router.post("", response_model=dict)
def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    """Create a new financial goal"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO goals (user_id, goal_type, target_amount, target_date, monthly_contribution, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, goal_type, target_amount, target_date, monthly_contribution, status, created_at
    """, (
        current_user["id"],
        goal.goal_type,
        goal.target_amount,
        goal.target_date,
        goal.monthly_contribution,
        goal.status
    ))
    
    new_goal = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return new_goal


@router.put("/{goal_id}", response_model=dict)
def update_goal(goal_id: int, goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    """Update an existing goal"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Verify goal belongs to user
    cur.execute("SELECT id FROM goals WHERE id = %s AND user_id = %s", (goal_id, current_user["id"]))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Goal not found")
    
    cur.execute("""
        UPDATE goals
        SET goal_type = %s,
            target_amount = %s,
            target_date = %s,
            monthly_contribution = %s,
            status = %s
        WHERE id = %s AND user_id = %s
        RETURNING id, goal_type, target_amount, target_date, monthly_contribution, status, created_at
    """, (
        goal.goal_type,
        goal.target_amount,
        goal.target_date,
        goal.monthly_contribution,
        goal.status,
        goal_id,
        current_user["id"]
    ))
    
    updated_goal = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return updated_goal


@router.delete("/{goal_id}")
def delete_goal(goal_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a goal"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Verify goal belongs to user
    cur.execute("SELECT id FROM goals WHERE id = %s AND user_id = %s", (goal_id, current_user["id"]))
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Goal not found")
    
    cur.execute("DELETE FROM goals WHERE id = %s AND user_id = %s", (goal_id, current_user["id"]))
    conn.commit()
    cur.close()
    conn.close()
    
    return {"message": "Goal deleted successfully"}
