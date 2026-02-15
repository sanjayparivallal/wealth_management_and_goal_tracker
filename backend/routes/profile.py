from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from security import get_current_user, hash_password, verify_password
from schema import ProfileUpdate, PasswordChange

router = APIRouter(prefix="/profile", tags=["profile"])




@router.get("")
def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            id,
            name,
            email,
            risk_profile,
            kyc_status,
            risk_score,
            profile_completed,
            created_at
        FROM users
        WHERE id = %s
    """, (current_user["id"],))
    
    profile = cur.fetchone()
    cur.close()
    conn.close()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile


@router.put("")
def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile (name only)"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE users
        SET name = %s
        WHERE id = %s
        RETURNING id, name, email, risk_profile, kyc_status, risk_score, profile_completed, created_at
    """, (
        profile_data.name,
        current_user["id"]
    ))
    
    updated_profile = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return updated_profile


@router.put("/password")
def change_password(password_data: PasswordChange, current_user: dict = Depends(get_current_user)):
    """Change user password"""
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get current password hash
    cur.execute("SELECT password FROM users WHERE id = %s", (current_user["id"],))
    user = cur.fetchone()
    
    if not user:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(password_data.current_password, user["password"]):
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Hash and update to new password
    new_hashed_password = hash_password(password_data.new_password)
    
    cur.execute("""
        UPDATE users
        SET password = %s
        WHERE id = %s
    """, (new_hashed_password, current_user["id"]))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {"message": "Password changed successfully"}
