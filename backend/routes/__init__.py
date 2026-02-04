from .auth import router as auth_router
from .risk_routes import router as risk_router
from .goals import router as goals_router
from .investments import router as investments_router
from .transactions import router as transactions_router
from .profile import router as profile_router

__all__ = [
    "auth_router",
    "risk_router",
    "goals_router",
    "investments_router",
    "transactions_router",
    "profile_router"
]
