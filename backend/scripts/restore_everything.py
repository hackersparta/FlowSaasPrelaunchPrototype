
import asyncio
import json
import sys
import os

sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import WorkflowTemplate, FreeTool
from app.services.n8n_client import n8n_client

async def restore():
    print("🔄 Starting System Restore from Backup...")
    
    file_path = "data/factory_reset.json"
    if not os.path.exists(file_path):
        print(f"❌ Error: {file_path} not found.")
        return
        
    with open(file_path, "r", encoding='utf-8') as f:
        data = json.load(f)
        
    db = SessionLocal()
    
    # 1. Restore Workflow Templates
    print("\\n🚀 Restoring Workflow Templates...")
    for t_data in data.get("workflow_templates", []):
        existing = db.query(WorkflowTemplate).filter(WorkflowTemplate.name == t_data['name']).first()
        if existing:
            print(f"   ⚠️ Skipping '{t_data['name']}' (already exists)")
            continue
            
        print(f"   👉 Importing: {t_data['name']}")
        new_template = WorkflowTemplate(
            name=t_data['name'],
            description=t_data['description'],
            category=t_data['category'],
            workflow_json=t_data['workflow_json'],
            input_schema=t_data['input_schema'],
            is_free=t_data['is_free'],
            credits_per_run=t_data['credits_per_run'],
            is_active=t_data['is_active']
        )
        db.add(new_template)
        db.flush()
        
        # Sync to n8n
        try:
            workflow_dict = json.loads(t_data['workflow_json'])
            workflow_dict['name'] = t_data['name']
            n8n_wf = await n8n_client.create_workflow(workflow_dict)
            new_template.n8n_workflow_id = n8n_wf['id']
            print(f"      ✅ Synced to n8n (ID: {n8n_wf['id']})")
        except Exception as e:
            print(f"      ⚠️ n8n sync failed: {e}")
            
    # 2. Restore Free Tools
    print("\\n🚀 Restoring Free Tools...")
    for tool_data in data.get("free_tools", []):
        existing = db.query(FreeTool).filter(FreeTool.slug == tool_data['slug']).first()
        if existing:
            print(f"   ⚠️ Skipping tool '{tool_data['name']}' (slug exists)")
            continue
            
        print(f"   👉 Importing: {tool_data['name']}")
        new_tool = FreeTool(**tool_data)
        db.add(new_tool)
        
    db.commit()
    print("\\n🏁 Restore Complete!")

if __name__ == "__main__":
    asyncio.run(restore())
