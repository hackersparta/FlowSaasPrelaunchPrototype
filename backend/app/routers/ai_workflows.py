
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Annotated
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.guards.admin_guard import get_admin_user
from app.services.ai_service import AIWorkflowFactory
from app.services.admin_service import admin_service
import json

router = APIRouter(
    prefix="/admin/ai",
    tags=["admin-ai"],
    responses={404: {"description": "Not found"}},
)

class GenerateWorkflowRequest(BaseModel):
    prompt: str
    provider: str

class GenerateWorkflowResponse(BaseModel):
    workflow_json: Dict[str, Any]
    input_schema: List[Dict[str, Any]]
    provider_used: str

class SaveWorkflowRequest(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = "AI Generated"
    workflow_json: Dict[str, Any]
    input_schema: List[Dict[str, Any]]
    is_active: bool = False

@router.get("/providers")
async def get_providers(admin_user: Annotated[User, Depends(get_admin_user)]):
    """Get list of available AI providers configured in the system."""
    return {"providers": AIWorkflowFactory.get_available_providers()}

@router.post("/generate", response_model=GenerateWorkflowResponse)
async def generate_workflow(
    request: GenerateWorkflowRequest,
    admin_user: Annotated[User, Depends(get_admin_user)]
):
    """Generate an n8n workflow and schema based on a prompt."""
    try:
        provider = AIWorkflowFactory.get_provider(request.provider)
        ai_response = provider.generate_workflow(request.prompt)
        
        # Expecting { "workflow": {...}, "schema": [...] }
        workflow_json = ai_response.get("workflow", {})
        input_schema = ai_response.get("schema", [])
        
        return {
            "workflow_json": workflow_json,
            "input_schema": input_schema,
            "provider_used": request.provider
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Generation failed: {str(e)}"
        )

@router.post("/save")
async def save_workflow(
    request: SaveWorkflowRequest,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Save the generated workflow and schema as a template."""
    try:
        # Convert dict to JSON string for storage
        workflow_str = json.dumps(request.workflow_json)
        schema_str = json.dumps(request.input_schema)
        
        # Reuse AdminService logic
        template = await admin_service.create_template_from_json(
            db=db,
            admin_user=admin_user,
            workflow_json=workflow_str,
            name=request.name,
            description=request.description,
            category=request.category,
            is_free=False, # Default to paid
            credits_per_run=1, # Default cost
            input_schema=schema_str
        )
        return template

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save workflow: {str(e)}"
        )
