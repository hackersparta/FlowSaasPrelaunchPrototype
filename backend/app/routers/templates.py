# backend/app/routers/templates.py
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
import json

from ..database import get_db
from ..models import WorkflowTemplate, User, WorkflowInstance, Execution, ExecutionStatus
from ..schemas import WorkflowTemplatePublic, WorkflowRunRequest
from ..routers.auth import get_current_user
from ..services.n8n_client import n8n_client

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("", response_model=List[WorkflowTemplatePublic])
async def list_active_templates(db: Session = Depends(get_db)):
    """
    List only active templates for the marketplace.
    Public endpoint - no authentication required.
    """
    templates = db.query(WorkflowTemplate).filter(WorkflowTemplate.is_active == True).all()
    return templates

@router.get("/{template_id}", response_model=WorkflowTemplatePublic)
async def get_template_details(template_id: UUID, db: Session = Depends(get_db)):
    """
    Get details of a specific active template.
    Public endpoint for marketplace.
    """
    template = db.query(WorkflowTemplate).filter(
        WorkflowTemplate.id == template_id,
        WorkflowTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or not active")
    
    return template

@router.post("/{template_id}/run")
async def run_template(
    template_id: UUID, 
    request: WorkflowRunRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Execute a template for a user.
    Deducts credits and performs placeholder replacement.
    """
    template = db.query(WorkflowTemplate).filter(
        WorkflowTemplate.id == template_id,
        WorkflowTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found or not active")
    
    # 1. Credit Check
    if not template.is_free:
        if current_user.credits_balance < template.credits_per_run:
            raise HTTPException(status_code=402, detail="Insufficient credits")
        
        # Deduct credits
        current_user.credits_balance -= template.credits_per_run
        db.commit()

    # 2. Placeholder Replacement
    workflow_str = template.workflow_json
    if template.input_schema:
        try:
            schema = json.loads(template.input_schema)
            for field in schema:
                placeholder = field.get('placeholder')
                label = field.get('label')
                field_type = field.get('type')
                
                # Find matching value in request.inputs by the label
                val = request.inputs.get(label)
                
                if placeholder and val:
                    # Logic for Credential Creation
                    if field_type == 'credential':
                        cred_type = label 
                        cred_data_key = "apiKey"
                        if "telegram" in cred_type.lower():
                            cred_data_key = "accessToken"
                        
                        print(f"User Run: Creating credential for {cred_type}...")
                        cred = await n8n_client.create_credential(
                            name=f"USER_CRED_{current_user.email}_{uuid4().hex[:4]}",
                            credential_type=cred_type,
                            data={cred_data_key: val}
                        )
                        val = cred.get('id')
                        print(f"Credential created with ID: {val}")

                    # Global replacement in the JSON string
                    workflow_str = workflow_str.replace(placeholder, str(val))
        except Exception as e:
            print(f"Error during placeholder replacement: {e}")

    # 3. Create and Execute temporary workflow
    new_execution = None
    try:
        workflow_json = json.loads(workflow_str)
        workflow_json['name'] = f"USER_RUN: {template.name} ({current_user.email})"
        
        created_workflow = await n8n_client.create_workflow(workflow_json)
        n8n_id = created_workflow.get('id')
        
        # --- PERSISTENCE START ---
        # A. Create WorkflowInstance
        workflow_instance = WorkflowInstance(
            user_id=current_user.id,
            template_id=str(template.id),
            is_active=True,
            n8n_workflow_id=n8n_id
        )
        db.add(workflow_instance)
        db.commit()
        db.refresh(workflow_instance)

        # B. Create Execution Record (RUNNING)
        from ..models import Execution, ExecutionStatus
        from datetime import datetime, timezone

        new_execution = Execution(
            workflow_instance_id=workflow_instance.id,
            user_id=current_user.id,
            status=ExecutionStatus.RUNNING,
            credits_used=template.credits_per_run if not template.is_free else 0
        )
        db.add(new_execution)
        db.commit()
        db.refresh(new_execution)
        # --- PERSISTENCE END ---

        # Activate the workflow so triggers (Schedule, Webhook) work
        print(f"Activating workflow {n8n_id}...")
        await n8n_client.activate_workflow(n8n_id)

        # For scheduled workflows, n8n will execute automatically
        # We need to poll for the execution ID
        import asyncio
        n8n_execution_id = None
        
        # Wait a bit for n8n to start the execution
        print(f"Waiting for n8n to start execution...")
        await asyncio.sleep(3)  # Initial wait
        
        # Poll for up to 60 seconds to find the execution
        for attempt in range(60):
            try:
                print(f"Polling attempt {attempt + 1}/60...")
                executions = await n8n_client.list_executions(workflow_id=n8n_id)
                print(f"API response: {executions}")
                
                if executions.get("data") and len(executions["data"]) > 0:
                    # Get the most recent execution
                    latest_exec = executions["data"][0]
                    n8n_execution_id = str(latest_exec.get("id"))
                    print(f"✅ Found n8n execution: {n8n_execution_id}")
                    break
                else:
                    print(f"No executions found yet, waiting...")
            except Exception as e:
                print(f"Polling error: {e}")
            
            await asyncio.sleep(1)
        
        # Store the n8n execution ID
        if n8n_execution_id:
            new_execution.n8n_execution_id = n8n_execution_id
            print(f"Stored execution ID: {n8n_execution_id}")
        else:
            print(f"⚠️ WARNING: Could not find n8n execution ID after 60 seconds")
        
        # --- UPDATE EXECUTION START ---
        new_execution.status = ExecutionStatus.SUCCESS
        new_execution.ended_at = datetime.now(timezone.utc)
        db.commit()
        # --- UPDATE EXECUTION END ---
        
        
        return {
            "success": True,
            "execution_id": str(new_execution.id),
            "n8n_execution_id": n8n_execution_id
        }
    except Exception as e:
        # --- ERROR HANDLING START ---
        if new_execution:
            new_execution.status = ExecutionStatus.FAILED
            new_execution.error_message = str(e)
            new_execution.ended_at = datetime.now(timezone.utc)
            db.commit()
        # --- ERROR HANDLING END ---

        # Re-raise as HTTP exception so frontend sees it as failure
        raise HTTPException(status_code=500, detail=str(e))
