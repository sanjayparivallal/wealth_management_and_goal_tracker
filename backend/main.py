from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from routes.auth import router as auth_router
from routes.risk_routes import router as risk_router
from routes.goals import router as goals_router
from routes.investments import router as investments_router
from routes.transactions import router as transactions_router
from routes.profile import router as profile_router
from routes.simulations import router as simulations_router
from routes.dashboard import router as dashboard_router
from routes.recommendations import router as recommendations_router
from database import get_db_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    # Startup
    print("📦 Starting application...")
    # Celery worker handles background tasks now
    yield
    # Shutdown
    print("🛑 Shutting down application...")


app = FastAPI(lifespan=lifespan)

# Add CORS middleware BEFORE including routers
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(risk_router)
app.include_router(goals_router)
app.include_router(investments_router)
app.include_router(transactions_router)
app.include_router(profile_router)
app.include_router(simulations_router)
app.include_router(dashboard_router)
app.include_router(recommendations_router)


@app.get("/")
def root():
    return {"message": "Welcome to Wealth Management API"}

@app.get("/health")
def health():
    return {"status": "ok"}


