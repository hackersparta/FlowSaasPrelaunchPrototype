# backend/app/routers/admin.py
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from ..database import get_db
from ..models import User, WorkflowTemplate
from ..guards.admin_guard import get_admin_user
from ..schemas import (
    WorkflowTemplateUpload,
    WorkflowTemplateUpdate,
    WorkflowTemplateResponse,
    WorkflowTestRequest,
    WorkflowTestResponse
)
from ..services.admin_service import admin_service
from ..services.n8n_client import n8n_client

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/templates/upload", response_model=WorkflowTemplateResponse)
async def upload_workflow_template(
    upload: WorkflowTemplateUpload,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Upload n8n workflow JSON and create a new template.
    Admin manually uploads JSON after testing in their own n8n instance.
    """
    template = await admin_service.create_template_from_json(
        db=db,
        admin_user=admin_user,
        workflow_json=upload.workflow_json,
        name=upload.name,
        description=upload.description,
        category=upload.category,
        is_free=upload.is_free,
        credits_per_run=upload.credits_per_run,
        input_schema=upload.input_schema
    )
    return template

@router.get("/templates", response_model=List[WorkflowTemplateResponse])
async def list_all_templates(
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    List all templates (including inactive ones).
    Admin only endpoint.
    """
    templates = db.query(WorkflowTemplate).all()
    return templates

@router.get("/templates/{template_id}", response_model=WorkflowTemplateResponse)
async def get_template(
    template_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Get single template details.
    """
    template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.patch("/templates/{template_id}", response_model=WorkflowTemplateResponse)
async def update_template(
    template_id: UUID,
    update: WorkflowTemplateUpdate,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Update template configuration (name, description, pricing, input schema, etc.)
    """
    template = await admin_service.update_template_config(
        db=db,
        template_id=template_id,
        name=update.name,
        description=update.description,
        category=update.category,
        is_free=update.is_free,
        credits_per_run=update.credits_per_run,
        input_schema=update.input_schema
    )
    return template

@router.post("/templates/{template_id}/test", response_model=WorkflowTestResponse)
async def test_template(
    template_id: UUID,
    test_request: WorkflowTestRequest,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Test workflow execution with provided test data.
    Creates workflow in our n8n instance if not already created.
    """
    result = await admin_service.test_workflow(
        db=db,
        template_id=template_id,
        test_data=test_request.test_data
    )
    return WorkflowTestResponse(**result)

@router.post("/templates/{template_id}/activate", response_model=WorkflowTemplateResponse)
async def activate_template(
    template_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Activate template for marketplace.
    Template must be tested first (have n8n_workflow_id).
    """
    template = await admin_service.activate_template(db=db, template_id=template_id)
    return template

@router.post("/templates/{template_id}/deactivate", response_model=WorkflowTemplateResponse)
async def deactivate_template(
    template_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Deactivate template from marketplace.
    """
    template = await admin_service.deactivate_template(db=db, template_id=template_id)
    return template

@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Delete a template.
    """
    await admin_service.delete_template(db=db, template_id=template_id)
    return {"message": "Template deleted successfully"}

@router.get("/n8n/workflows")
async def list_n8n_workflows(
    admin_user: Annotated[User, Depends(get_admin_user)]
):
    """
    List all workflows in our n8n instance.
    Useful for debugging.
    """
    workflows = await n8n_client.list_workflows()
    return workflows

@router.post("/users/{user_email}/add-credits")
async def add_credits_to_user(
    user_email: str,
    credits: int,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """
    Manually add credits to a user account.
    Temporary endpoint for testing while Razorpay integration is being fixed.
    """
    from ..services.credit_ledger import record_transaction
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_balance = record_transaction(
        user_id=user.id,
        amount=credits,
        description=f"Manual credit addition by admin",
        reference_id=f"admin_add_{admin_user.id}",
        db=db
    )
    
    return {
        "success": True,
        "user_email": user_email,
        "credits_added": credits,
        "new_balance": new_balance
    }
