# backend/app/routers/automations.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, UUID4
from datetime import datetime
from ..database import get_db
from ..models import AutomationRun, User
from ..routers.auth import get_current_user

router = APIRouter(prefix="/automations", tags=["automations"])


# Schemas
class AutomationCreate(BaseModel):
    automation_type: str  # 'csv-to-mysql', 'qr-bulk', etc.
    input_method: str  # 'cloud_link', 'upload', 'text'
    input_url: str = None
    input_text: str = None
    output_method: str  # 'email', 'dashboard'
    output_email: str = None
    schedule_type: str = 'once'  # 'once', 'daily', 'weekly'
    parameters: str = None  # JSON string


class AutomationResponse(BaseModel):
    id: UUID4
    automation_type: str
    input_method: str
    input_url: str = None
    output_method: str
    output_email: str = None
    schedule_type: str
    status: str
    error_message: str = None
    credits_used: int
    created_at: datetime
    last_run_at: datetime = None
    
    class Config:
        from_attributes = True


@router.post("/run", response_model=AutomationResponse)
async def create_automation(
    automation: AutomationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create and queue a new automation run.
    For 'once' type, it will execute immediately via background worker.
    For 'daily'/'weekly', it will be scheduled.
    """
    # Validate credits
    credits_required = 5  # Base cost for any automation
    if current_user.credits_balance < credits_required:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    # Create automation run
    new_run = AutomationRun(
        user_id=current_user.id,
        automation_type=automation.automation_type,
        input_method=automation.input_method,
        input_url=automation.input_url,
        input_text=automation.input_text,
        output_method=automation.output_method,
        output_email=automation.output_email,
        schedule_type=automation.schedule_type,
        parameters=automation.parameters,
        status='pending'
    )
    
    # Set next_run_at for scheduled runs
    if automation.schedule_type == 'once':
        new_run.next_run_at = datetime.utcnow()
    elif automation.schedule_type == 'daily':
        # Schedule for tomorrow 9 AM
        from datetime import timedelta
        new_run.next_run_at = datetime.utcnow().replace(hour=9, minute=0, second=0) + timedelta(days=1)
    elif automation.schedule_type == 'weekly':
        # Schedule for next Monday 9 AM
        from datetime import timedelta
        days_until_monday = (7 - datetime.utcnow().weekday()) % 7 or 7
        new_run.next_run_at = datetime.utcnow().replace(hour=9, minute=0, second=0) + timedelta(days=days_until_monday)
    
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    
    # Trigger background worker for 'once' type
    if automation.schedule_type == 'once':
        from ..worker import process_automation
        process_automation.delay(str(new_run.id))
    
    return new_run


@router.get("/user", response_model=List[AutomationResponse])
async def list_user_automations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all automation runs for current user.
    Used for the automation dashboard.
    """
    automations = db.query(AutomationRun).filter(
        AutomationRun.user_id == current_user.id
    ).order_by(AutomationRun.created_at.desc()).all()
    
    return automations


@router.get("/{automation_id}", response_model=AutomationResponse)
async def get_automation_status(
    automation_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get status and details of a specific automation run.
    """
    automation = db.query(AutomationRun).filter(
        AutomationRun.id == automation_id,
        AutomationRun.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    return automation


@router.get("/{automation_id}/result")
async def get_automation_result(
    automation_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download the result file if output_method was 'dashboard'.
    Returns the file content.
    """
    automation = db.query(AutomationRun).filter(
        AutomationRun.id == automation_id,
        AutomationRun.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    if automation.status != 'complete':
        raise HTTPException(status_code=400, detail="Automation not yet complete")
    
    if not automation.output_file_path:
        raise HTTPException(status_code=404, detail="No result file available")
    
    # Read and return file
    import os
    if not os.path.exists(automation.output_file_path):
        raise HTTPException(status_code=404, detail="Result file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(automation.output_file_path)


@router.delete("/{automation_id}")
async def cancel_automation(
    automation_id: UUID4,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel/delete an automation run.
    """
    automation = db.query(AutomationRun).filter(
        AutomationRun.id == automation_id,
        AutomationRun.user_id == current_user.id
    ).first()
    
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    # Can only cancel pending automations
    if automation.status == 'processing':
        raise HTTPException(status_code=400, detail="Cannot cancel running automation")
    
    db.delete(automation)
    db.commit()
    
    return {"message": "Automation cancelled"}
