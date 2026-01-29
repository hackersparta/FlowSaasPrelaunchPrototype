# backend/app/routers/executions.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from ..database import get_db
from ..models import User, WorkflowInstance
from ..worker import execute_workflow_task
from .auth import get_current_user

router = APIRouter(prefix="/executions", tags=["executions"])

@router.post("/{workflow_instance_id}")
def trigger_execution(
    workflow_instance_id: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify ownership (Mock check since we didn't fully implement WorkflowInstance creation API yet)
    # In real app: check if workflow_instance belongs to user
    # workflow = db.query(WorkflowInstance).filter(WorkflowInstance.id == workflow_instance_id, WorkflowInstance.user_id == current_user.id).first()
    # if not workflow: raise HTTPException(404)

    # For MVP: We just assume valid ID and pass to worker
    # Worker handles the heavy lifting / additional checks
    
    # 3 mock credits cost for demo
    cost = 2 
    if current_user.credits_balance < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits. Please top up.")

    task = execute_workflow_task.delay(workflow_instance_id, str(current_user.id), cost)
    
    return {"status": "queued", "task_id": str(task.id)}

@router.get("/")
def list_my_executions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns execution history with workflow details.
    Manually aggregates WorkflowInstance and WorkflowTemplate data.
    """
    from ..models import Execution, WorkflowInstance, WorkflowTemplate
    from ..services.sync_service import sync_executions_for_user
    
    # Sync first (optional, can be heavy)
    # sync_executions_for_user(current_user.id, db)
    
    executions = db.query(Execution).filter(
        Execution.user_id == current_user.id
    ).order_by(Execution.started_at.desc()).limit(20).all()
    
    results = []
    for exc in executions:
        workflow_name = "Unknown Workflow"
        template_id = None
        
        # Manual fetch relationship (N+1 but safe for small limits)
        if exc.workflow_instance_id:
            instance = db.query(WorkflowInstance).filter(WorkflowInstance.id == exc.workflow_instance_id).first()
            if instance:
                if instance.template_id:
                     # Try to parse UUID or string
                    try:
                        tmpl = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == UUID(instance.template_id)).first()
                        if tmpl:
                            workflow_name = tmpl.name
                            template_id = str(tmpl.id)
                    except:
                        pass
        
        results.append({
            "id": exc.id,
            "status": exc.status,
            "credits_used": exc.credits_used,
            "started_at": exc.started_at,
            "ended_at": exc.ended_at,
            "error_message": exc.error_message,
            "workflow_name": workflow_name,
            "template_id": template_id,
            "n8n_execution_id": exc.n8n_execution_id
        })
    
    return results

@router.get("/{execution_id}/details")
async def get_execution_details(
    execution_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed execution with visual workflow graph.
    Returns execution metadata + workflow structure + node statuses.
    """
    from ..models import Execution, WorkflowInstance, WorkflowTemplate
    from ..services.n8n_client import n8n_client
    
    exc = db.query(Execution).filter(
        Execution.id == execution_id,
        Execution.user_id == current_user.id
    ).first()
    
    if not exc:
        raise HTTPException(status_code=404, detail="Execution not found")

    # Fetch workflow metadata
    workflow_name = "Unknown Workflow"
    trigger_type = "manual"
    total_runs = 0
    last_run_at = None
    n8n_workflow_id = None
    
    if exc.workflow_instance_id:
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == exc.workflow_instance_id
        ).first()
        
        if instance:
            n8n_workflow_id = instance.n8n_workflow_id
            
            # Get template info
            if instance.template_id:
                try:
                    tmpl = db.query(WorkflowTemplate).filter(
                        WorkflowTemplate.id == UUID(instance.template_id)
                    ).first()
                    if tmpl:
                        workflow_name = tmpl.name
                except:
                    pass
            
            # Count total runs for this workflow instance
            total_runs = db.query(Execution).filter(
                Execution.workflow_instance_id == instance.id
            ).count()
            
            # Get last run time
            last_exec = db.query(Execution).filter(
                Execution.workflow_instance_id == instance.id,
                Execution.id != execution_id
            ).order_by(Execution.started_at.desc()).first()
            
            if last_exec:
                last_run_at = last_exec.started_at

    # Fetch n8n execution data and workflow structure
    graph_data = {"nodes": [], "connections": []}
    n8n_execution_data = None
    n8n_execution_id = exc.n8n_execution_id
    
    if n8n_workflow_id:
        try:
            # Fetch workflow structure first
            workflow_structure = await n8n_client.get_workflow(n8n_workflow_id)
            
            # Fetch ALL executions for this workflow from n8n to get accurate count
            print(f"Fetching all executions for workflow {n8n_workflow_id} to get live count")
            executions_list = await n8n_client.list_executions(workflow_id=n8n_workflow_id)
            
            # Update total_runs with LIVE count from n8n
            if executions_list.get("data"):
                total_runs = len(executions_list["data"])
                print(f"Live execution count from n8n: {total_runs}")
            
            # Determine trigger type from workflow
            if workflow_structure.get("nodes"):
                first_node = workflow_structure["nodes"][0]
                node_type = first_node.get("type", "")
                if "schedule" in node_type.lower():
                    trigger_type = "schedule"
                elif "webhook" in node_type.lower():
                    trigger_type = "webhook"
            
            # If we don't have an execution ID, fetch the latest one from n8n
            if not n8n_execution_id:
                print(f"No stored execution ID, fetching latest from n8n for workflow {n8n_workflow_id}")
                
                if executions_list.get("data") and len(executions_list["data"]) > 0:
                    latest_exec = executions_list["data"][0]
                    n8n_execution_id = str(latest_exec.get("id"))
                    print(f"Found latest execution: {n8n_execution_id}")
                    
                    # Update the database with this execution ID
                    exc.n8n_execution_id = n8n_execution_id
                    db.commit()
                else:
                    print("No executions found in n8n for this workflow")
            
            # Now fetch execution data if we have an ID
            if n8n_execution_id:
                print(f"Fetching execution data for {n8n_execution_id}")
                n8n_execution_data = await n8n_client.get_execution_result(n8n_execution_id)
                
                # Parse into graph with execution status
                graph_data = n8n_client.parse_workflow_graph(workflow_structure, n8n_execution_data)
                print(f"Graph parsed: {len(graph_data['nodes'])} nodes, {len(graph_data['connections'])} connections")
            else:
                # No execution yet, just show the workflow structure without status
                graph_data = n8n_client.parse_workflow_graph(workflow_structure, None)
                print(f"No execution data, showing workflow structure only")
                    
        except Exception as e:
            print(f"Failed to fetch n8n details: {e}")
            import traceback
            traceback.print_exc()
            # Continue with empty graph
    
    return {
        "execution": {
            "id": str(exc.id),
            "status": exc.status,
            "started_at": exc.started_at.isoformat() if exc.started_at else None,
            "ended_at": exc.ended_at.isoformat() if exc.ended_at else None,
            "credits_used": exc.credits_used,
            "error_message": exc.error_message
        },
        "workflow": {
            "id": n8n_workflow_id,
            "name": workflow_name,
            "trigger_type": trigger_type,
            "total_runs": total_runs,
            "last_run_at": last_run_at.isoformat() if last_run_at else None
        },
        "graph": graph_data,
        "raw_execution": n8n_execution_data  # For debugging
    }
