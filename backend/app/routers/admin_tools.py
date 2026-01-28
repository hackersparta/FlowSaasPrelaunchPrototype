# backend/app/routers/admin_tools.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from pydantic import BaseModel
from uuid import UUID
from ..database import get_db
from ..models import User, FreeTool
from ..guards.admin_guard import get_admin_user

router = APIRouter(prefix="/admin/tools", tags=["admin-tools"])

class ToolUpload(BaseModel):
    name: str
    slug: str
    description: str
    category: str
    icon: str
    input_type: str
    output_type: str
    python_code: str
    seo_title: str = None
    seo_description: str = None
    seo_keywords: str = None

class ToolUpdate(BaseModel):
    name: str = None
    description: str = None
    category: str = None
    icon: str = None
    is_active: bool = None
    seo_title: str = None
    seo_description: str = None
    seo_keywords: str = None

@router.post("/upload")
def upload_tool(
    tool_data: ToolUpload,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Upload a new tool"""
    # Check if slug already exists
    existing = db.query(FreeTool).filter(FreeTool.slug == tool_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tool with this slug already exists")
    
    try:
        # Auto-install dependencies
        from ..services.package_manager import install_missing_packages
        install_missing_packages(tool_data.python_code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to install dependencies: {str(e)}")

    # Auto-generate SEO fields if not provided
    if not tool_data.seo_title:
        tool_data.seo_title = f"{tool_data.name} - Free Online Tool | FlowSaaS"
    if not tool_data.seo_description:
        tool_data.seo_description = f"{tool_data.description} Use this free online {tool_data.name} to process your files securely. No signup required."
    if not tool_data.seo_keywords:
        tool_data.seo_keywords = f"{tool_data.name}, free tool, online utility, {tool_data.category}"

    tool = FreeTool(**tool_data.dict(), is_active=True)  # Auto-activate if installed successfully
    db.add(tool)
    db.commit()
    db.refresh(tool)
    
    return {"success": True, "tool_id": str(tool.id), "message": "Tool uploaded and dependencies installed"}

@router.get("/")
def list_all_tools_admin(
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """List all tools (including inactive)"""
    tools = db.query(FreeTool).all()
    return tools

@router.patch("/{tool_id}")
def update_tool(
    tool_id: UUID,
    updates: ToolUpdate,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Update tool metadata"""
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(tool, key, value)
    
    db.commit()
    db.refresh(tool)
    
    return {"success": True, "message": "Tool updated successfully"}

@router.post("/{tool_id}/activate")
def activate_tool(
    tool_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Activate a tool"""
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool.is_active = True
    db.commit()
    
    return {"success": True, "message": "Tool activated"}

@router.post("/{tool_id}/deactivate")
def deactivate_tool(
    tool_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Deactivate a tool"""
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    tool.is_active = False
    db.commit()
    
    return {"success": True, "message": "Tool deactivated"}

@router.delete("/{tool_id}")
def delete_tool(
    tool_id: UUID,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Delete a tool"""
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    db.delete(tool)
    db.commit()
    
    return {"success": True, "message": "Tool deleted"}
