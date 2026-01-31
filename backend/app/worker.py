# backend/app/worker.py
import os
from celery import Celery
import time

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery(
    "flowsaas_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.worker.execute_workflow_task": "main-queue",
        "app.tasks.sync_tasks.sync_all_users_executions": "main-queue",
    },
    beat_schedule={
        'sync-executions-every-5-minutes': {
            'task': 'app.tasks.sync_tasks.sync_all_users_executions',
            'schedule': 300.0,  # Every 5 minutes (300 seconds)
        },
    }
)

@celery_app.task(bind=True, max_retries=3)
def execute_workflow_task(self, workflow_instance_id: str, user_id: str, cost: int = 1):
    """
    Executes a workflow instance.
    1. Check credits (redundant safety) & Deduct
    2. Trigger n8n workflow
    3. Update status
    """
    from .database import SessionLocal
    from .services.credit_ledger import deduct_credits_for_execution
    from .services.execution_service import create_execution, update_execution_status
    from .services.n8n_client import n8n_client
    from .models import ExecutionStatus
    import asyncio
    from uuid import UUID

    db = SessionLocal()
    execution = None
    try:
        # 0. Create Execution Record
        execution = create_execution(UUID(user_id), UUID(workflow_instance_id), db)
        
        # 1. Deduct Credits
        deduct_credits_for_execution(UUID(user_id), cost, execution.id, db)
        
        # 2. Update to Running
        update_execution_status(execution.id, ExecutionStatus.RUNNING, db)
        
        # 3. Trigger n8n (Async wrapper needed for Celery)
        # Note: In production, n8n trigger should be an ID or webhook. 
        # Here we mock user workflow activation.
        # loop = asyncio.get_event_loop()
        # loop.run_until_complete(n8n_client.activate_workflow("some_n8n_id"))
        
        print(f"Executing workflow {workflow_instance_id} for user {user_id}")
        time.sleep(2) # Mock execution time

        # 4. Success
        update_execution_status(execution.id, ExecutionStatus.SUCCESS, db)
        
        return {"status": "success", "execution_id": str(execution.id)}

    except Exception as e:
        print(f"Execution failed: {str(e)}")
        if execution:
            update_execution_status(execution.id, ExecutionStatus.FAILED, db, error_message=str(e))
        
        # Refund logic could go here if failure was system-internal and not user-logic
        
        raise self.retry(exc=e, countdown=10)
    finally:
        db.close()
