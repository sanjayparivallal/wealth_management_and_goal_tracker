from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta
from database import get_db_connection
from security import verify_password, create_access_token, hash_password
from schema import UserCreate, UserResponse, TokenResponse
from psycopg2 import errors
from jose import JWTError, jwt
import os

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set for Flask application. Did you forget to run source .env?")
if not ALGORITHM:
    raise ValueError("No ALGORITHM set for Flask application. Did you forget to run source .env?")

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate):
    print(f"Signup attempt for: {user.email}")
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if user already exists
        cur.execute(
            "SELECT id FROM users WHERE email = %s",
            (user.email,)
        )
        existing_user = cur.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please login instead."
            )

        # Hash the password
        hashed_password = hash_password(user.password)

        # Insert new user
        cur.execute(
            """
            INSERT INTO users (name, email, password, risk_profile, kyc_status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, name, email, risk_profile, kyc_status, created_at
            """,
            (user.name, user.email, hashed_password, user.risk_profile.value, user.kyc_status.value)
        )
        new_user = cur.fetchone()

        conn.commit()
        return new_user

    except errors.UniqueViolation:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please login instead."
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Signup Error: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch complete user data including ID, name, email
    cur.execute(
        "SELECT id, name, email, password FROM users WHERE email = %s",
        (form_data.username,)
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not found. Please check or sign up."
        )

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again."
        )

    # Create access token with user ID as 'sub' and include email and name
    # Note: JWT 'sub' field must be a string per JWT spec
    access_token = create_access_token(
        data={
            "sub": str(user["id"]),  # Convert user ID to string for JWT
            "email": user["email"],
            "name": user["name"]
        },
        expires_delta=timedelta(minutes=45)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_current_user_endpoint(token: str = Depends(oauth2_scheme)):
    """Get current user info from JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")  # Get user ID as string from JWT
        
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. Please log in."
            )
        
        # Convert string user ID to integer for database query
        user_id = int(user_id_str)
        
    except (JWTError, ValueError) as e:
        print(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again."
        )

    conn = get_db_connection()
    cur = conn.cursor()

    # Query by user ID
    cur.execute(
        "SELECT id, name, email, risk_profile, kyc_status, profile_completed, created_at FROM users WHERE id = %s",
        (user_id,)
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please log in again."
        )

    return user
