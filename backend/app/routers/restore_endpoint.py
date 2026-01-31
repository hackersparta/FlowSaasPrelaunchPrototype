# backend/app/routers/restore_endpoint.py
import asyncio
import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from ..database import get_db
from ..models import WorkflowTemplate, FreeTool, User
from ..guards.admin_guard import get_admin_user
from ..services.n8n_client import n8n_client

router = APIRouter(prefix="/admin", tags=["admin-restore"])

@router.post("/restore-from-backup")
async def restore_from_backup(
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Restore workflows and tools from factory_reset.json backup.
    This endpoint allows restoring without shell access (free Render tier).
    """
    file_path = "data/factory_reset.json"
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404, 
            detail=f"Backup file not found at {file_path}. Make sure it's deployed with the code."
        )
    
    try:
        with open(file_path, "r", encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read backup file: {str(e)}")
    
    results = {
        "workflows_restored": 0,
        "workflows_skipped": 0,
        "tools_restored": 0,
        "tools_skipped": 0,
        "errors": []
    }
    
    # 1. Restore Workflow Templates
    for t_data in data.get("workflow_templates", []):
        try:
            existing = db.query(WorkflowTemplate).filter(WorkflowTemplate.name == t_data['name']).first()
            if existing:
                results["workflows_skipped"] += 1
                continue
            
            new_template = WorkflowTemplate(
                name=t_data['name'],
                description=t_data['description'],
                category=t_data['category'],
                workflow_json=t_data['workflow_json'],
                input_schema=t_data['input_schema'],
                is_free=t_data['is_free'],
                credits_per_run=t_data['credits_per_run'],
                is_active=t_data['is_active'],
                created_by=admin_user.id
            )
            db.add(new_template)
            db.flush()
            
            # Sync to n8n
            try:
                workflow_dict = json.loads(t_data['workflow_json'])
                workflow_dict['name'] = t_data['name']
                n8n_wf = await n8n_client.create_workflow(workflow_dict)
                new_template.n8n_workflow_id = n8n_wf['id']
            except Exception as n8n_error:
                results["errors"].append(f"n8n sync failed for '{t_data['name']}': {str(n8n_error)}")
            
            results["workflows_restored"] += 1
            
        except Exception as e:
            results["errors"].append(f"Failed to restore workflow '{t_data.get('name', 'unknown')}': {str(e)}")
    
    # 2. Restore Free Tools
    for tool_data in data.get("free_tools", []):
        try:
            existing = db.query(FreeTool).filter(FreeTool.slug == tool_data['slug']).first()
            if existing:
                results["tools_skipped"] += 1
                continue
            
            new_tool = FreeTool(**tool_data)
            db.add(new_tool)
            results["tools_restored"] += 1
            
        except Exception as e:
            results["errors"].append(f"Failed to restore tool '{tool_data.get('name', 'unknown')}': {str(e)}")
    
    db.commit()
    
    return {
        "success": True,
        "message": "Restore completed",
        "results": results
    }
