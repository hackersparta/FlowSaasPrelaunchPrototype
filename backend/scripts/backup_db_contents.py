
import json
import sys
import os

sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import WorkflowTemplate, FreeTool

def backup():
    db = SessionLocal()
    data = {
        "workflow_templates": [],
        "free_tools": []
    }
    
    print("[*] Backing up database contents...")
    
    # 1. Backup Workflow Templates
    templates = db.query(WorkflowTemplate).all()
    for t in templates:
        data["workflow_templates"].append({
            "name": t.name,
            "description": t.description,
            "category": t.category,
            "workflow_json": t.workflow_json,
            "input_schema": t.input_schema,
            "is_free": t.is_free,
            "credits_per_run": t.credits_per_run,
            "is_active": t.is_active
        })
    print(f"   [OK] Saved {len(templates)} Workflow Templates")
    
    # 2. Backup Free Tools
    tools = db.query(FreeTool).all()
    for tool in tools:
        data["free_tools"].append({
            "name": tool.name,
            "slug": tool.slug,
            "description": tool.description,
            "category": tool.category,
            "icon": tool.icon,
            "input_type": tool.input_type,
            "output_type": tool.output_type,
            "python_code": tool.python_code,
            "content_json": tool.content_json,
            "is_active": tool.is_active,
            "seo_title": tool.seo_title,
            "seo_description": tool.seo_description,
            "seo_keywords": tool.seo_keywords
        })
    print(f"   [OK] Saved {len(tools)} Free Tools")
    
    # Ensure data dir exists
    os.makedirs("data", exist_ok=True)
    
    with open("data/factory_reset.json", "w", encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n[DONE] Backup complete! Saved to backend/data/factory_reset.json")
    print("You can now push this file to Git to preserve your data.")

if __name__ == "__main__":
    backup()
