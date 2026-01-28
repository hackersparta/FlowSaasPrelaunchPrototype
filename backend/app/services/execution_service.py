# backend/app/services/execution_service.py
from sqlalchemy.orm import Session
from ..models import Execution, ExecutionStatus
from uuid import UUID
from datetime import datetime, timezone

def create_execution(user_id: UUID, workflow_instance_id: UUID, db: Session) -> Execution:
    execution = Execution(
        user_id=user_id,
        workflow_instance_id=workflow_instance_id,
        status=ExecutionStatus.PENDING
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution

def update_execution_status(execution_id: UUID, status: ExecutionStatus, db: Session, error_message: str = None):
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if execution:
        execution.status = status
        if status in [ExecutionStatus.SUCCESS, ExecutionStatus.FAILED]:
            execution.ended_at = datetime.now(timezone.utc)
        if error_message:
            execution.error_message = error_message
        db.commit()
        return execution
    return None
