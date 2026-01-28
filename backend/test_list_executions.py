import asyncio
import sys
sys.path.append('/app')

from app.services.n8n_client import n8n_client

async def test_list_executions():
    # Test listing executions for a specific workflow
    workflow_id = "VlVQSK3IKjLfMXgc"  # From the debug output
    
    print(f"Fetching executions for workflow: {workflow_id}")
    
    try:
        result = await n8n_client.list_executions(workflow_id=workflow_id)
        print(f"API Response: {result}")
        
        if result.get("data"):
            print(f"\nFound {len(result['data'])} executions:")
            for exec in result["data"][:3]:  # Show first 3
                print(f"  - ID: {exec.get('id')}, Status: {exec.get('finished')}, Started: {exec.get('startedAt')}")
        else:
            print("No executions found in response")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_list_executions())
