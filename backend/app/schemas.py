from pydantic import BaseModel, UUID4, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID4
    credits_balance: int
    is_active: bool
    is_admin: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ExecutionBase(BaseModel):
    workflow_instance_id: UUID4

class ExecutionCreate(ExecutionBase):
    pass

class Execution(ExecutionBase):
    id: UUID4
    user_id: UUID4
    status: ExecutionStatus
    credits_used: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

# Workflow Template Schemas
class WorkflowTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None

class WorkflowTemplateUpload(BaseModel):
    """Schema for uploading workflow JSON"""
    workflow_json: str  # Raw n8n workflow JSON as string
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_free: bool = False
    credits_per_run: int = 0
    input_schema: Optional[str] = None  # JSON string
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class WorkflowTemplateUpdate(BaseModel):
    """Schema for updating template configuration"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_free: Optional[bool] = None
    credits_per_run: Optional[int] = None
    input_schema: Optional[str] = None  # JSON string
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class WorkflowTemplateResponse(BaseModel):
    id: UUID4
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    workflow_json: str
    n8n_workflow_id: Optional[str] = None
    is_free: bool
    credits_per_run: int
    input_schema: Optional[str] = None
    is_active: bool
    created_by: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

    class Config:
        from_attributes = True

class WorkflowTemplatePublic(BaseModel):
    """Public template info for marketplace (without workflow_json)"""
    id: UUID4
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_free: bool
    credits_per_run: int
    input_schema: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

    class Config:
        from_attributes = True

class WorkflowTestRequest(BaseModel):
    """Request to test workflow execution"""
    template_id: UUID4
    test_data: Dict[str, Any]  # User inputs for testing

class WorkflowTestResponse(BaseModel):
    """Response from workflow test"""
    success: bool
    execution_id: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class WorkflowRunRequest(BaseModel):
    """Request from a user to run an active template"""
    inputs: Dict[str, Any]
