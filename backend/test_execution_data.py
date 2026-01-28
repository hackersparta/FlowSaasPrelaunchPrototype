import asyncio
import sys
sys.path.append('/app')

from app.services.n8n_client import n8n_client
from app.database import SessionLocal
from app.models import Execution, WorkflowInstance
from sqlalchemy import desc

async def test_execution_data():
    db = SessionLocal()
    
    # Get the most recent execution
    execution = db.query(Execution).order_by(desc(Execution.started_at)).first()
    
    if not execution:
        print("No executions found")
        return
    
    print(f"Execution ID: {execution.id}")
    print(f"Status: {execution.status}")
    print(f"n8n_execution_id: {execution.n8n_execution_id}")
    print(f"workflow_instance_id: {execution.workflow_instance_id}")
    
    if execution.workflow_instance_id:
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == execution.workflow_instance_id
        ).first()
        
        if instance:
            print(f"n8n_workflow_id: {instance.n8n_workflow_id}")
            
            # Try to fetch workflow structure
            if instance.n8n_workflow_id:
                try:
                    workflow = await n8n_client.get_workflow(instance.n8n_workflow_id)
                    print(f"Workflow has {len(workflow.get('nodes', []))} nodes")
                    
                    # Try to fetch execution data
                    if execution.n8n_execution_id:
                        exec_data = await n8n_client.get_execution_result(execution.n8n_execution_id)
                        print(f"Execution data retrieved: {exec_data.get('finished', False)}")
                    else:
                        print("No n8n_execution_id - cannot fetch execution data")
                        
                except Exception as e:
                    print(f"Error fetching from n8n: {e}")
        else:
            print("WorkflowInstance not found")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(test_execution_data())
