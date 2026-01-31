# backend/app/services/admin_service.py
import json
import os
from typing import Dict, Any, Optional
from uuid import UUID, uuid4
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import WorkflowTemplate, User
from .n8n_client import n8n_client

class AdminService:
    """Service for admin workflow template management"""
    
    async def create_template_from_json(
        self, 
        db: Session, 
        admin_user: User,
        workflow_json: str,
        name: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        is_free: bool = False,
        credits_per_run: int = 0,
        input_schema: Optional[str] = None
    ) -> WorkflowTemplate:
        """
        Create a new template from uploaded n8n workflow JSON.
        The workflow is NOT yet created in n8n at this stage.
        Admin will configure it first, then test it.
        """
        # Validate JSON
        try:
            json_data = json.loads(workflow_json)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")
        
        # Create template record
        template = WorkflowTemplate(
            name=name,
            description=description,
            category=category,
            workflow_json=workflow_json,
            created_by=admin_user.id,
            is_active=False,  # Start as inactive
            is_free=is_free,
            credits_per_run=credits_per_run,
            input_schema=input_schema
        )
        
        db.add(template)
        db.commit()
        db.refresh(template)
        
        return template
    
    async def update_template_config(
        self,
        db: Session,
        template_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        category: Optional[str] = None,
        is_free: Optional[bool] = None,
        credits_per_run: Optional[int] = None,
        input_schema: Optional[str] = None
    ) -> WorkflowTemplate:
        """
        Update template configuration.
        """
        template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        if name is not None:
            template.name = name
        if description is not None:
            template.description = description
        if category is not None:
            template.category = category
        if is_free is not None:
            template.is_free = is_free
        if credits_per_run is not None:
            template.credits_per_run = credits_per_run
        if input_schema is not None:
            # Validate input schema is valid JSON
            try:
                json.loads(input_schema)
                template.input_schema = input_schema
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid input schema JSON")
        
        db.commit()
        db.refresh(template)
        
        return template
    
    async def test_workflow(
        self,
        db: Session,
        template_id: UUID,
        test_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Test workflow execution with placeholder replacement.
        Creates a temporary test workflow in n8n with replaced values.
        """
        template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # 1. Load the original workflow JSON string
        workflow_str = template.workflow_json
        
        # 2. Perform global string replacement for configured placeholders
        if template.input_schema:
            try:
                schema = json.loads(template.input_schema)
                for field in schema:
                    placeholder = field.get('placeholder')
                    label = field.get('label')
                    field_type = field.get('type')
                    
                    # Find matching value in test_data by the label
                    val = test_data.get(label)
                    
                    if placeholder and val:
                        # Logic for Credential Creation
                        if field_type == 'credential':
                            # We assume the credential type is the label or we'd need another field
                            # For simplicity now, let's assume the admin knows the n8n credential type
                            # e.g. "telegramApi", "deepSeekApi"
                            # We also need to know the 'key' n8n expects (usually 'apiKey' or 'accessToken')
                            
                            cred_type = label # Admin should set label to n8n cred type or we add a field
                            # Common mappings
                            cred_data_key = "apiKey"
                            if "telegram" in cred_type.lower():
                                cred_data_key = "accessToken"
                            
                            print(f"Creating credential for {cred_type}...")
                            cred = await n8n_client.create_credential(
                                name=f"TEMP_CRED_{template.name}_{uuid4().hex[:4]}",
                                credential_type=cred_type,
                                data={cred_data_key: val}
                            )
                            val = cred.get('id')
                            print(f"Credential created with ID: {val}")

                        # Global replacement in the JSON string
                        workflow_str = workflow_str.replace(placeholder, str(val))
            except Exception as e:
                print(f"Error during placeholder replacement: {e}")

        # 3. Create a temporary test workflow in n8n
        # We always create a fresh one for testing to ensure latest config is used
        try:
            workflow_json = json.loads(workflow_str)
            # Add a prefix to distinguish in n8n UI
            workflow_json['name'] = f"TEST_RUN: {template.name}"
            
            created_workflow = await n8n_client.create_workflow(workflow_json)
            test_n8n_id = created_workflow.get('id')
            
            # If this is the first successful test run, we can also link it to the template
            # to avoid re-creating it during activation, though activation usually makes the "final" one.
            # For now, let's just use it and track the ID.
            template.n8n_workflow_id = test_n8n_id
            db.commit()

            # 4. Try to activate the workflow (needed for schedule/cron triggers)
            try:
                await n8n_client.activate_workflow(test_n8n_id)
                activation_status = "activated and ready to run on schedule"
            except Exception as activation_error:
                print(f"Activation error: {activation_error}")
                activation_status = "created but not activated (might need manual activation)"

            # 5. Return success with workflow details
            # Note: The URL must be accessible by the browser (localhost), not internal Docker host.
            public_n8n_host = os.getenv('PUBLIC_N8N_URL', 'http://localhost:5678')
            return {
                "success": True,
                "execution_id": test_n8n_id,
                "n8n_workflow_id": test_n8n_id,
                "result": {
                    "status": activation_status,
                    "workflow_url": f"{public_n8n_host}/workflow/{test_n8n_id}",
                    "note": "For workflows with schedule/cron triggers, check the n8n UI to verify execution. Webhooks and manual triggers can be tested immediately."
                },
                "message": f"Workflow {activation_status} in n8n. You can view it at: {public_n8n_host}/workflow/{test_n8n_id}",
                "workflow_url": f"{public_n8n_host}/workflow/{test_n8n_id}",
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "execution_id": None,
                "result": None,
                "error": f"n8n Test Run Error: {str(e)}"
            }

    
    async def activate_template(
        self,
        db: Session,
        template_id: UUID
    ) -> WorkflowTemplate:
        """
        Activate template for marketplace.
        Requires that workflow has been tested (n8n_workflow_id exists).
        """
        template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        if not template.n8n_workflow_id:
            raise HTTPException(
                status_code=400, 
                detail="Template must be tested before activation (no n8n workflow created)"
            )
        
        if not template.input_schema:
            raise HTTPException(
                status_code=400,
                detail="Template must have input schema configured before activation"
            )
        
        template.is_active = True
        db.commit()
        db.refresh(template)
        
        return template
    
    async def deactivate_template(
        self,
        db: Session,
        template_id: UUID
    ) -> WorkflowTemplate:
        """
        Deactivate template from marketplace.
        """
        template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        template.is_active = False
        db.commit()
        db.refresh(template)
        
        return template
    
    async def delete_template(
        self,
        db: Session,
        template_id: UUID
    ) -> bool:
        """
        Delete a template.
        """
        template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        db.delete(template)
        db.commit()
        
        return True

admin_service = AdminService()
