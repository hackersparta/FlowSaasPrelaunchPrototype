import asyncio
import sys
sys.path.append('/app')

from app.services.n8n_client import n8n_client
from app.database import SessionLocal
from app.models import Execution, WorkflowInstance
from uuid import UUID

async def test_details_endpoint():
    db = SessionLocal()
    
    # The execution ID from the user
    execution_id = "9f3e96a9-7e65-404a-b7e3-cc1608ec08e7"
    
    exc = db.query(Execution).filter(
        Execution.id == UUID(execution_id)
    ).first()
    
    if not exc:
        print("Execution not found!")
        return
    
    print(f"Execution ID: {exc.id}")
    print(f"n8n_execution_id: {exc.n8n_execution_id}")
    print(f"workflow_instance_id: {exc.workflow_instance_id}")
    
    if exc.workflow_instance_id:
        instance = db.query(WorkflowInstance).filter(
            WorkflowInstance.id == exc.workflow_instance_id
        ).first()
        
        if instance:
            print(f"n8n_workflow_id: {instance.n8n_workflow_id}")
            
            # Try to fetch workflow structure
            if instance.n8n_workflow_id:
                try:
                    print("\n=== Fetching Workflow Structure ===")
                    workflow = await n8n_client.get_workflow(instance.n8n_workflow_id)
                    print(f"Workflow name: {workflow.get('name')}")
                    print(f"Number of nodes: {len(workflow.get('nodes', []))}")
                    
                    # Show first node
                    if workflow.get('nodes'):
                        first_node = workflow['nodes'][0]
                        print(f"\nFirst node:")
                        print(f"  - Name: {first_node.get('name')}")
                        print(f"  - Type: {first_node.get('type')}")
                        print(f"  - Position: {first_node.get('position')}")
                    
                    # Try to fetch execution data
                    if exc.n8n_execution_id:
                        print(f"\n=== Fetching Execution Data ===")
                        exec_data = await n8n_client.get_execution_result(exc.n8n_execution_id)
                        print(f"Execution finished: {exec_data.get('finished')}")
                        print(f"Execution mode: {exec_data.get('mode')}")
                        
                        # Check run data
                        run_data = exec_data.get('data', {}).get('resultData', {}).get('runData', {})
                        print(f"Number of nodes executed: {len(run_data)}")
                        
                        # Parse graph
                        print(f"\n=== Parsing Graph ===")
                        graph = n8n_client.parse_workflow_graph(workflow, exec_data)
                        print(f"Graph nodes: {len(graph['nodes'])}")
                        print(f"Graph connections: {len(graph['connections'])}")
                        
                        # Show first node status
                        if graph['nodes']:
                            first = graph['nodes'][0]
                            print(f"\nFirst node in graph:")
                            print(f"  - Name: {first['name']}")
                            print(f"  - Status: {first['status']}")
                            print(f"  - Execution time: {first.get('execution_time')}")
                    else:
                        print("\n❌ No n8n_execution_id stored!")
                        
                except Exception as e:
                    print(f"Error: {e}")
                    import traceback
                    traceback.print_exc()
    
    db.close()

if __name__ == "__main__":
    asyncio.run(test_details_endpoint())
