import asyncio
import sys
import os
import json

# Add parent directory to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import WorkflowTemplate
from app.services.n8n_client import N8nClient

async def sync():
    db = SessionLocal()
    client = N8nClient()
    
    print("🔄 Starting Template -> n8n Sync...")
    
    templates = db.query(WorkflowTemplate).filter(WorkflowTemplate.is_active == True).all()
    
    for tmpl in templates:
        print(f"Checking template: {tmpl.name}...")
        
        # If ID is missing or we want to force re-sync (optional logic)
        # For now, only sync if ID is missing or if we suspect it's not in n8n
        should_create = False
        
        if not tmpl.n8n_workflow_id:
            should_create = True
        else:
            # Optional: Check if it actually exists?
            try:
                await client.get_workflow(tmpl.n8n_workflow_id)
                print(f"  ✅ Exists in n8n (ID: {tmpl.n8n_workflow_id})")
            except:
                print(f"  ⚠️  ID {tmpl.n8n_workflow_id} not found in n8n. Re-creating.")
                should_create = True
        
        if should_create:
            try:
                workflow_json = json.loads(tmpl.workflow_json) if isinstance(tmpl.workflow_json, str) else tmpl.workflow_json
                
                # Create in n8n
                print(f"  Creating in n8n...")
                result = await client.create_workflow(workflow_json)
                new_id = result['id']
                
                # Update DB
                tmpl.n8n_workflow_id = new_id
                db.commit()
                print(f"  ✅ Created! New ID: {new_id}")
                
            except Exception as e:
                print(f"  ❌ Failed to create: {e}")

    print("🏁 Sync Complete.")

if __name__ == "__main__":
    asyncio.run(sync())
