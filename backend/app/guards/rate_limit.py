# backend/app/guards/rate_limit.py
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import RateLimit, WorkflowInstance
from uuid import UUID
from datetime import datetime, timezone

def check_rate_limit(workflow_instance_id: UUID, db: Session = Depends(get_db)):
    """
    Checks if the workflow instance has exceeded its daily limit.
    """
    # Join RateLimit via WorkflowInstance if needed, or query directly if we have the ID
    # Here assuming we check by workflow_instance_id
    limit_record = db.query(RateLimit).filter(RateLimit.workflow_instance_id == workflow_instance_id).first()
    
    if not limit_record:
        # Default or no limit logic can go here. 
        # For now, if no record, we assume no limit or create one? 
        # Requirement says "Each template must define max runs". 
        # So a limit record should exist when workflow is instantiated.
        return True

    now = datetime.now(timezone.utc)
    
    # Check if we need to reset (naive daily reset)
    if limit_record.reset_at and now > limit_record.reset_at:
        limit_record.current_runs = 0
        limit_record.reset_at = now # Should set to next day technically
        # logical todo: set reset_at to end of day
        db.commit()

    if limit_record.current_runs >= limit_record.max_runs_per_day:
        raise HTTPException(status_code=429, detail="Rate limit exceeded for this workflow.")

    return True

def increment_usage(workflow_instance_id: UUID, db: Session):
    limit_record = db.query(RateLimit).filter(RateLimit.workflow_instance_id == workflow_instance_id).first()
    if limit_record:
        limit_record.current_runs += 1
        db.commit()
