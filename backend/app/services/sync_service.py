
from sqlalchemy import text, create_engine
from sqlalchemy.orm import Session
from ..database import SQLALCHEMY_DATABASE_URL
from ..models import User, Execution, WorkflowInstance, ExecutionStatus, RateLimit, WorkflowTemplate
from uuid import UUID
import os

# Create a separate engine connection for raw SQL queries if needed, 
# but we can reuse the session or main engine.
# However, n8n data is in the SAME database but different table.
# We can query 'execution_entity' directly via raw SQL in the same session.

def sync_executions_for_user(user_id: UUID, db: Session):
    """
    Syncs executions from n8n 'execution_entity' table to our 'executions' table.
    """
    try:
        # 1. Get all n8n_workflow_ids for this user's active instances
        # We need to map n8n_workflow_id -> internal workflow_instance_id logic
        # Current data model: WorkflowInstance has n8n_workflow_id (String)
        
        user_instances = db.query(WorkflowInstance).filter(
            WorkflowInstance.user_id == user_id,
            WorkflowInstance.is_active == True
        ).all()
        
        if not user_instances:
            return

        n8n_map = {instance.n8n_workflow_id: instance.id for instance in user_instances if instance.n8n_workflow_id}
        n8n_ids = list(n8n_map.keys())
        
        if not n8n_ids:
            return

        # 2. Query n8n executions
        # We only want finished executions or running ones?
        # Let's get everything that isn't already synced.
        
        # Format tuple for SQL IN clause
        if len(n8n_ids) == 1:
            ids_tuple = f"('{n8n_ids[0]}')"
        else:
            ids_tuple = str(tuple(n8n_ids))
            
        # Select executions for these workflows
        query = text(f"""
            SELECT id, "workflowId", "startedAt", "stoppedAt", status 
            FROM execution_entity 
            WHERE "workflowId" IN {ids_tuple}
        """)
        
        result = db.execute(query)
        n8n_executions = result.fetchall()
        
        # 3. Import new executions
        for row in n8n_executions:
            n8n_id = str(row[0]) # ID is integer in n8n, convert to string
            workflow_id = row[1]
            started_at = row[2]
            stopped_at = row[3] # Can be None
            status_raw = row[4] # 'success', 'error', 'running'
            
            # Check if exists
            exists = db.query(Execution).filter(Execution.n8n_execution_id == n8n_id).first()
            if exists:
                continue

            # Map status
            status = ExecutionStatus.RUNNING
            if status_raw == 'success':
                status = ExecutionStatus.SUCCESS
            elif status_raw == 'error':
                status = ExecutionStatus.FAILED
            
            
            # Get the template to determine credit cost
            workflow_instance = db.query(WorkflowInstance).filter(
                WorkflowInstance.id == n8n_map[workflow_id]
            ).first()
            
            credits_to_deduct = 0
            if workflow_instance and workflow_instance.template_id:
                template = db.query(WorkflowTemplate).filter(
                    WorkflowTemplate.id == workflow_instance.template_id
                ).first()
                
                if template and not template.is_free:
                    credits_to_deduct = template.credits_per_run
            
            # Create Execution
            new_execution = Execution(
                user_id=user_id,
                workflow_instance_id=n8n_map[workflow_id],
                n8n_execution_id=n8n_id,
                status=status,
                started_at=started_at,
                ended_at=stopped_at,
                credits_used=credits_to_deduct
            )
            
            db.add(new_execution)
            
            # Deduct credits if needed
            if credits_to_deduct > 0:
                user = db.query(User).filter(User.id == user_id).first()
                if user and user.credits_balance >= credits_to_deduct:
                    from .credit_ledger import deduct_credits_for_execution
                    try:
                        deduct_credits_for_execution(user_id, credits_to_deduct, new_execution.id, db)
                    except Exception as credit_error:
                        print(f"Credit deduction failed: {credit_error}")
                        # Continue anyway - execution already happened
        
        db.commit()
        
    except Exception as e:
        print(f"Sync failed: {e}")
        # Don't block the UI request if sync fails
