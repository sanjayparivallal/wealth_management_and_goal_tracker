from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from enum import Enum


# ================== ENUMS ==================

class RiskProfile(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class KYCStatus(str, Enum):
    unverified = "unverified"
    verified = "verified"


class GoalType(str, Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    custom = "custom"


class GoalStatus(str, Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class AssetType(str, Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"
    crypto = "crypto"


class TransactionType(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


# ================== USERS & PROFILE ==================

class UserBase(BaseModel):
    name: str
    email: EmailStr
    risk_profile: RiskProfile
    kyc_status: KYCStatus


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=16, description="Password must be 8-16 characters")
    risk_profile: RiskProfile = Field(default=RiskProfile.moderate)
    kyc_status: KYCStatus = Field(default=KYCStatus.unverified)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 16:
            raise ValueError('Password must not exceed 16 characters')
        return v


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ProfileUpdate(BaseModel):
    name: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ================== RISK ASSESSMENT ==================

class Answer(BaseModel):
    questionId: int
    score: int


class RiskAssessmentSubmit(BaseModel):
    answers: List[Answer]
    user_id: int
    kyc_status: str  # "verified" or "unverified"


# ================== GOALS ==================

class GoalBase(BaseModel):
    goal_type: GoalType
    target_amount: float
    target_date: date
    monthly_contribution: float
    status: GoalStatus


class GoalCreate(GoalBase):
    """Create model - user_id comes from JWT token"""
    pass


class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ================== INVESTMENTS ==================

class InvestmentBase(BaseModel):
    asset_type: AssetType
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    current_value: float
    last_price: float


class InvestmentCreate(InvestmentBase):
    """Create model - user_id comes from JWT token"""
    pass


class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    last_price_at: datetime

    class Config:
        from_attributes = True


# ================== TRANSACTIONS ==================

class TransactionBase(BaseModel):
    symbol: str
    type: TransactionType
    quantity: float
    price: float
    fees: float


class TransactionCreate(TransactionBase):
    """Create model - user_id comes from JWT token"""
    asset_type: AssetType = Field(default=AssetType.stock, description="Asset type for new investments")


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    executed_at: datetime

    class Config:
        from_attributes = True


# ================== RECOMMENDATIONS ==================

class RecommendationBase(BaseModel):
    title: str
    recommendation_text: str
    suggested_allocation: Dict


class RecommendationCreate(RecommendationBase):
    user_id: int


class RecommendationResponse(RecommendationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ================== SIMULATIONS ==================

class SimulationCreate(BaseModel):
    scenario_name: str
    initial_amount: float
    monthly_contribution: float
    time_horizon_years: int
    expected_return_rate: float
    inflation_rate: float
    goal_id: Optional[int] = None


class SimulationResponse(BaseModel):
    id: int
    scenario_name: str
    assumptions: Dict[str, Any]
    results: Dict[str, Any]
    created_at: Any
    goal_id: Optional[int] = None

    class Config:
        from_attributes = True
