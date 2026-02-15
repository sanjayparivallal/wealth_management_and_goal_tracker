from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from security import get_current_user
from services.simulation_service import SimulationService
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json

router = APIRouter(prefix="/simulations", tags=["simulations"])

# Pydantic models
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

@router.post("", response_model=SimulationResponse)
def create_simulation(sim_data: SimulationCreate, current_user: dict = Depends(get_current_user)):
    """Run and save a new simulation."""
    # 1. Run the simulation
    service = SimulationService()
    assumptions = {
        "initial_amount": sim_data.initial_amount,
        "monthly_contribution": sim_data.monthly_contribution,
        "time_horizon_years": sim_data.time_horizon_years,
        "expected_return_rate": sim_data.expected_return_rate,
        "inflation_rate": sim_data.inflation_rate
    }
    
    results = service.run_simulation(assumptions)
    
    # 2. Save to Database
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO simulations 
            (user_id, scenario_name, assumptions, results, goal_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, scenario_name, assumptions, results, created_at
        """, (
            current_user["id"],
            sim_data.scenario_name,
            json.dumps(assumptions),
            json.dumps(results),
            sim_data.goal_id
        ))
        
        saved_sim = cur.fetchone()
        conn.commit()
        return saved_sim
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.get("", response_model=List[SimulationResponse])
def get_user_simulations(current_user: dict = Depends(get_current_user)):
    """List all simulations for the current user."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, scenario_name, assumptions, results, created_at
        FROM simulations
        WHERE user_id = %s
        ORDER BY created_at DESC
    """, (current_user["id"],))
    
    sims = cur.fetchall()
    cur.close()
    conn.close()
    
    return sims

@router.delete("/{sim_id}")
def delete_simulation(sim_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a simulation."""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM simulations WHERE id = %s AND user_id = %s", (sim_id, current_user["id"]))
    
    if cur.rowcount == 0:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    conn.commit()
    cur.close()
    conn.close()
    
    return {"message": "Simulation deleted"}
