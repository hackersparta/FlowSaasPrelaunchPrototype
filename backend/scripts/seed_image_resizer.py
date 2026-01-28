import asyncio
import json
import sys
import os

# Add parent directory to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import FreeTool, WorkflowTemplate
from sqlalchemy import text

async def seed():
    db = SessionLocal()
    
    # 1. Read Python Code
    try:
        with open("app/tools_library/image_resizer.py", "r") as f:
            python_code = f.read()
    except Exception as e:
        print(f"Error reading python file: {e}")
        return

    # 2. Read Workflow JSON
    try:
        with open("app/workflows/image_resizer_workflow.json", "r") as f:
            workflow_json = f.read()
    except Exception as e:
        print(f"Error reading workflow file: {e}")
        return

    # 3. Define Rich Content
    content_json = {
        "features": [
            "Resize unlimited images in bulk",
            "Maintain aspect ratio automatically",
            "Compress output to save space",
            "Secure processing (files deleted after 1h)"
        ],
        "faqs": [
            {
                "question": "Is this tool free?",
                "answer": "Yes, our Bulk Image Resizer is 100% free with no daily limits."
            },
            {
                "question": "Does it reduce image quality?",
                "answer": "We use high-quality Lanczos resampling to ensure crisp images even when reducing size."
            }
        ],
        "how_to": [
            "Upload your image or image batch.",
            "Select 'Percentage' or enter fixed Width/Height.",
            "Click 'Resize' and download your optimized files."
        ],
        "pain_point": "Resizing product images weekly manually?",
        "solution": "Auto-resize images in FTP folder -> SFTP upload"
    }

    # 4. Insert/Update Tool
    tool_slug = "bulk-image-resizer"
    
    # Check if exists
    existing_tool = db.query(FreeTool).filter(FreeTool.slug == tool_slug).first()
    
    if existing_tool:
        print(f"Updating existing tool: {tool_slug}")
        existing_tool.python_code = python_code
        existing_tool.content_json = json.dumps(content_json)
        # Update other fields...
    else:
        print(f"Creating new tool: {tool_slug}")
        new_tool = FreeTool(
            name="Bulk Image Resizer",
            slug=tool_slug,
            description="Resize JPG, PNG, and WebP images online for free. Visual tool for ecommerce and social media.",
            category="Image Tools",
            icon="🖼️",
            input_type="file",
            output_type="file",
            python_code=python_code,
            is_active=True,
            seo_title="Bulk Image Resizer - Free Online Image Converter | FlowSaaS",
            seo_description="Resize multiple images at once online. Free bulk image resizer tool for JPG, PNG, and WebP. No signup required.",
            seo_keywords="image resizer, bulk resize, photo editor, free online tool",
            content_json=json.dumps(content_json),
            usage_count=0
        )
        db.add(new_tool)
    
    # 5. Create the Upsell Workflow Template (linked conceptually via category/tags, or we can add a direct link later)
    # For now, we will add it to the generic templates.
    
    new_workflow = WorkflowTemplate(
        name="Auto-Resize FTP Images",
        description="Watch an FTP folder for new product images, resize them automatically, and upload to S3.",
        category="E-commerce Automation",
        workflow_json=workflow_json,
        is_free=False,
        credits_per_run=10,
        is_active=True
    )
    db.add(new_workflow)

    db.commit()
    print("✅ Seed Complete: Bulk Image Resizer & Automation Workflow")

if __name__ == "__main__":
    asyncio.run(seed())
