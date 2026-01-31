# backend/app/tasks/sync_tasks.py
from celery import shared_task
from ..database import SessionLocal
from ..services.sync_service import sync_executions_for_user
from ..models import User

@shared_task
def sync_all_users_executions():
    """
    Periodic task to sync n8n executions for all active users.
    Should run every 5 minutes via Celery Beat.
    """
    db = SessionLocal()
    try:
        # Get all users with active workflow instances
        from sqlalchemy import distinct
        from ..models import WorkflowInstance
        
        active_user_ids = db.query(distinct(WorkflowInstance.user_id)).filter(
            WorkflowInstance.is_active == True
        ).all()
        
        synced_count = 0
        for (user_id,) in active_user_ids:
            try:
                sync_executions_for_user(user_id, db)
                synced_count += 1
            except Exception as user_error:
                print(f"Failed to sync user {user_id}: {user_error}")
                continue
        
        print(f"✅ Synced executions for {synced_count} users")
        return synced_count
        
    finally:
        db.close()


@shared_task
def sync_user_executions(user_id: str):
    """
    Sync executions for a specific user.
    Can be called after workflow activation or manually.
    """
    db = SessionLocal()
    try:
        from uuid import UUID
        sync_executions_for_user(UUID(user_id), db)
        print(f"✅ Synced executions for user {user_id}")
    finally:
        db.close()
