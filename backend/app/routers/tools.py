# backend/app/routers/tools.py
from fastapi import APIRouter, Depends, HTTPException, Request, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from ..database import get_db
from ..models import FreeTool
from ..services.tool_executor import execute_tool
import random

router = APIRouter(prefix="/tools", tags=["tools"])

class ToolResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str
    category: str
    icon: str
    input_type: str
    output_type: str
    usage_count: int
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    input_schema: Optional[str] = None

    class Config:
        from_attributes = True

class ToolExecuteRequest(BaseModel):
    input_data: Optional[str] = None
    mode: Optional[str] = None
    length: Optional[int] = None
    include_symbols: Optional[bool] = None
    algorithm: Optional[str] = None
    text1: Optional[str] = None
    text2: Optional[str] = None
    paragraphs: Optional[int] = None
    words_per_para: Optional[int] = None
    count: Optional[int] = None
    version: Optional[int] = None
    input_color: Optional[str] = None
    from_format: Optional[str] = None
    markdown_text: Optional[str] = None

@router.post("/debug-auth")
def debug_auth(request: Request):
    """Temporary debug endpoint"""
    import os
    return {
        "env_secret": os.getenv("INTERNAL_API_SECRET"),
        "headers": dict(request.headers)
    }

@router.get("/", response_model=List[ToolResponse])
def list_all_tools(db: Session = Depends(get_db)):
    """Get all active tools"""
    tools = db.query(FreeTool).filter(FreeTool.is_active == True).all()
    return tools

@router.get("/random", response_model=List[ToolResponse])
def get_random_tools(limit: int = 12, db: Session = Depends(get_db)):
    """Get random tools for homepage"""
    tools = db.query(FreeTool).filter(FreeTool.is_active == True).all()
    random_tools = random.sample(tools, min(limit, len(tools)))
    return random_tools

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all categories with tool counts"""
    categories = db.query(
        FreeTool.category,
        func.count(FreeTool.id).label('count')
    ).filter(FreeTool.is_active == True).group_by(FreeTool.category).all()
    
    return [{"name": cat, "count": count} for cat, count in categories]

@router.get("/category/{category}", response_model=List[ToolResponse])
def get_tools_by_category(category: str, db: Session = Depends(get_db)):
    """Get tools by category"""
    tools = db.query(FreeTool).filter(
        FreeTool.category == category,
        FreeTool.is_active == True
    ).all()
    return tools

@router.get("/{slug}")
def get_tool_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get single tool by slug"""
    tool = db.query(FreeTool).filter(FreeTool.slug == slug).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.post("/{slug}/execute")
async def execute_tool_endpoint(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Execute a tool"""
    tool = db.query(FreeTool).filter(FreeTool.slug == slug).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Parse JSON body directly to accept any fields
    try:
        kwargs = await request.json()
    except:
        kwargs = {}
    
    # Execute tool
    result = execute_tool(tool.python_code, **kwargs)
    
    # Increment usage count
    tool.usage_count += 1
    db.commit()
    
    return result

@router.post("/{slug}/execute-file")
async def execute_tool_file_endpoint(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Execute a tool with multi-part form data (files and fields)"""
    tool = db.query(FreeTool).filter(FreeTool.slug == slug).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Parse form data
    form = await request.form()
    kwargs = {}
    
    import logging
    logger = logging.getLogger("uvicorn")
    
    for key, value in form.items():
        # Using hasattr(value, "filename") is more robust than isinstance check
        if hasattr(value, "filename") and hasattr(value, "read"):
            try:
                content = await value.read()
                kwargs[key] = content
                kwargs[f"{key}_filename"] = value.filename
                logger.debug(f"Processed file field '{key}': {value.filename}")
                
                # Map the primary 'file' to 'input_file' for tool_executor compatibility
                if key == 'file':
                    kwargs['input_file'] = content
                    kwargs['filename'] = value.filename
            except Exception as e:
                logger.error(f"Error reading file field '{key}': {e}")
        else:
            # Handle string fields (like 'opacity', 'width', etc)
            # FormData sends everything as strings. We must attempt to parse numbers.
            val = value
            if isinstance(val, str):
                if val.isdigit():
                    val = int(val)
                else:
                    try:
                        # Try float if it matches a numeric pattern
                        if '.' in val and val.replace('.', '', 1).isdigit():
                            val = float(val)
                    except ValueError:
                        pass
            kwargs[key] = val

    # Execute tool
    # logger.info(f"Executing tool '{slug}' with kwargs types: {[ (k, type(v).__name__) for k, v in kwargs.items() ]}")
    result = execute_tool(tool.python_code, **kwargs)
    
    # Increment usage count
    tool.usage_count += 1
    db.commit()
    
    return result
