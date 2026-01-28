# backend/app/routers/ai_tools.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Annotated
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.guards.admin_guard import get_admin_user
from app.services.ai_service import AIWorkflowFactory
import json
import subprocess
import sys
import tempfile
import os

router = APIRouter(
    prefix="/admin/ai-tools",
    tags=["admin-ai-tools"],
    responses={404: {"description": "Not found"}},
)

class GenerateToolRequest(BaseModel):
    prompt: str
    provider: str

class GenerateToolResponse(BaseModel):
    metadata: Dict[str, Any]
    python_code: str
    input_schema: List[Dict[str, Any]]
    test_cases: List[Dict[str, Any]]
    dependencies: List[str]
    provider_used: str

class TestToolRequest(BaseModel):
    python_code: str
    test_inputs: Dict[str, Any]

class TestToolResponse(BaseModel):
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None

class SaveToolRequest(BaseModel):
    name: str
    slug: str
    description: str
    category: str
    icon: str
    input_type: str
    output_type: str
    python_code: str
    input_schema: List[Dict[str, Any]]
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

@router.get("/providers")
async def get_providers(admin_user: Annotated[User, Depends(get_admin_user)]):
    """Get list of available AI providers configured in the system."""
    return {"providers": AIWorkflowFactory.get_available_providers()}

@router.post("/generate", response_model=GenerateToolResponse)
async def generate_tool(
    request: GenerateToolRequest,
    admin_user: Annotated[User, Depends(get_admin_user)]
):
    """Generate a Python tool from a natural language prompt."""
    try:
        provider = AIWorkflowFactory.get_provider(request.provider)
        ai_response = provider.generate_tool(request.prompt)
        
        return {
            "metadata": ai_response.get("metadata", {}),
            "python_code": ai_response.get("python_code", ""),
            "input_schema": ai_response.get("input_schema", []),
            "test_cases": ai_response.get("test_cases", []),
            "dependencies": ai_response.get("dependencies", []),
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

@router.post("/test", response_model=TestToolResponse)
async def test_tool(
    request: TestToolRequest,
    admin_user: Annotated[User, Depends(get_admin_user)]
):
    """Test the generated tool code with provided inputs in a sandbox environment."""
    try:
        # Create a temporary file with the Python code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(request.python_code)
            temp_file = f.name
        
        try:
            # Create a test script that imports and executes the function with dict inputs
            test_inputs_json = json.dumps(request.test_inputs)
            test_script = f"""
import sys
import json

# Load the generated code
with open('{temp_file}', 'r') as f:
    exec(f.read(), globals())

# Execute the function
try:
    inputs = json.loads('''{test_inputs_json}''')
    result = execute(inputs)
    print(json.dumps({{"success": True, "result": result}}))
except Exception as e:
    print(json.dumps({{"success": False, "error": str(e)}}))
"""
            
            result = subprocess.run(
                [sys.executable, '-c', test_script],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                output_str = result.stdout.strip()
                if not output_str:
                    return {"success": False, "result": None, "error": "No output from test script"}
                
                output = json.loads(output_str)
                if output.get("success"):
                    return {
                        "success": True,
                        "result": output.get("result"),
                        "error": None
                    }
                else:
                    return {
                        "success": False,
                        "result": None,
                        "error": output.get("error", "Unknown error")
                    }
            else:
                return {
                    "success": False,
                    "result": None,
                    "error": result.stderr or "Code execution failed"
                }
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "result": None,
            "error": "Execution timed out (max 5 seconds)"
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": str(e)
        }

@router.post("/save")
async def save_tool(
    request: SaveToolRequest,
    admin_user: Annotated[User, Depends(get_admin_user)],
    db: Session = Depends(get_db)
):
    """Save the generated tool to the database."""
    try:
        from app.models import FreeTool
        
        existing = db.query(FreeTool).filter(FreeTool.slug == request.slug).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Tool with this slug already exists"
            )
        
        try:
            from app.services.package_manager import install_missing_packages
            install_missing_packages(request.python_code)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to install dependencies: {str(e)}"
            )
        
        seo_title = request.seo_title or f"{request.name} - Free Online Tool | FlowSaaS"
        seo_description = request.seo_description or f"{request.description} Use this free online {request.name} to process your files securely."
        seo_keywords = request.seo_keywords or f"{request.name}, free tool, online utility, {request.category}"
        
        tool = FreeTool(
            name=request.name,
            slug=request.slug,
            description=request.description,
            category=request.category,
            icon=request.icon,
            input_type=request.input_type,
            output_type=request.output_type,
            python_code=request.python_code,
            input_schema=json.dumps(request.input_schema),
            seo_title=seo_title,
            seo_description=seo_description,
            seo_keywords=seo_keywords,
            is_active=False
        )
        
        db.add(tool)
        db.commit()
        db.refresh(tool)
        
        return {
            "success": True,
            "tool_id": str(tool.id),
            "message": "Tool saved successfully. Dependencies installed."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save tool: {str(e)}"
        )
