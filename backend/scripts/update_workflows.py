import asyncio
import json
import sys
import os

sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import WorkflowTemplate
from app.services.n8n_client import N8nClient

# Production Workflow Definitions
WORKFLOWS = {
    "Auto-Resize Images from FTP to S3": {
        "name": "Auto-Resize Images from FTP to S3",
        "nodes": [
            {
                "parameters": {
                    "path": "/incoming/images",
                    "triggerOn": "fileCreated"
                },
                "name": "Watch FTP Folder",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [250, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "url": "=http://backend:8000/tools/bulk-image-resizer/execute-file",
                    "method": "POST",
                    "sendBinaryData": True,
                    "binaryPropertyName": "data",
                    "options": {}
                },
                "name": "Resize Image",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "bucket": "resized-images",
                    "fileKey": "={{$json.filename}}",
                    "binaryData": True,
                    "binaryPropertyName": "data"
                },
                "name": "Upload to S3",
                "type": "n8n-nodes-base.aws",
                "typeVersion": 1,
                "position": [650, 300],
                "credentials": {"aws": {"id": "2", "name": "AWS S3"}}
            }
        ],
        "connections": {
            "Watch FTP Folder": {"main": [[{"node": "Resize Image", "type": "main", "index":0}]]},
            "Resize Image": {"main": [[{"node": "Upload to S3", "type": "main", "index": 0}]]}
        }
    },
    
    "Auto-Sync CSV to MySQL": {
        "name": "Auto-Sync CSV to MySQL",
        "nodes": [
            {
                "parameters": {
                    "path": "/data/csvs",
                    "triggerOn": "fileCreated"
                },
                "name": "Watch CSV Folder",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [250, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/csv-to-mysql/execute-file",
                    "method": "POST",
                    "sendBinaryData": True,
                    "binaryPropertyName": "data"
                },
                "name": "Generate SQL",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "operation": "executeQuery",
                    "query": "={{$json.output}}"
                },
                "name": "Execute SQL",
                "type": "n8n-nodes-base.mysql",
                "typeVersion": 1,
                "position": [650, 300],
                "credentials": {"mysql": {"id": "3", "name": "MySQL DB"}}
            }
        ],
        "connections": {
            "Watch CSV Folder": {"main": [[{"node": "Generate SQL", "type": "main", "index": 0}]]},
            "Generate SQL": {"main": [[{"node": "Execute SQL", "type": "main", "index": 0}]]}
        }
    },
    
    "Daily API Backup to CSV": {
        "name": "Daily API Backup to CSV",
        "nodes": [
            {
                "parameters": {
                    "rule": {"interval": [{"triggerAtHour": 2}]}
                },
                "name": "Schedule (2 AM Daily)",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [250, 300]
            },
            {
                "parameters": {
                    "url": "={{$json.api_url}}",
                    "authentication": "genericCredentialType",
                    "genericAuthType": "httpHeaderAuth"
                },
                "name": "Fetch API Data",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/api-to-csv/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "options": {},
                    "bodyParametersJson": "={\"api_url\": \"{{$json.api_url}}\"}"
                },
                "name": "Convert to CSV",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [650, 300]
            },
            {
                "parameters": {
                    "path": "=/backups/api_{{$now.format('YYYY-MM-DD')}}.csv",
                    "binaryData": True,
                    "binaryPropertyName": "data"
                },
                "name": "Save to FTP",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [850, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            }
        ],
        "connections": {
            "Schedule (2 AM Daily)": {"main": [[{"node": "Fetch API Data", "type": "main", "index": 0}]]},
            "Fetch API Data": {"main": [[{"node": "Convert to CSV", "type": "main", "index": 0}]]},
            "Convert to CSV": {"main": [[{"node": "Save to FTP", "type": "main", "index": 0}]]}
        }
    },
    
    "Auto-Generate Invoice from Database": {
        "name": "Auto-Generate Invoice from Database",
        "nodes": [
            {
                "parameters": {
                    "pollTimes": {"item": [{"mode": "everyMinute"}]},
                    "operation": "select",
                    "table": "orders",
                    "where": "invoice_generated = 0"
                },
                "name": "Poll New Orders",
                "type": "n8n-nodes-base.mysql",
                "typeVersion": 1,
                "position": [250, 300],
                "credentials": {"mysql": {"id": "3", "name": "MySQL DB"}}
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/invoice-generator/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "bodyParametersJson": "={\"client_name\": \"{{$json.client_name}}\", \"amount\": {{$json.amount}}, \"invoice_number\": \"INV-{{$json.order_id}}\"}"
                },
                "name": "Generate Invoice PDF",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "fromEmail": "invoices@company.com",
                    "toEmail": "={{$json.client_email}}",
                    "subject": "=Invoice INV-{{$json.order_id}}",
                    "text": "Please find attached your invoice.",
                    "attachments": "data:application/pdf;base64,={{$json.output.output}}",
                    "options": {}
                },
                "name": "Email Invoice",
                "type": "n8n-nodes-base.emailSend",
                "typeVersion": 2,
                "position": [650, 300],
                "credentials": {"smtp": {"id": "4", "name": "SMTP Account"}}
            },
            {
                "parameters": {
                    "operation": "update",
                    "table": "orders",
                    "updateKey": "order_id",
                    "columns": "invoice_generated",
                    "values": "1"
                },
                "name": "Mark as Processed",
                "type": "n8n-nodes-base.mysql",
                "typeVersion": 1,
                "position": [850, 300],
                "credentials": {"mysql": {"id": "3", "name": "MySQL DB"}}
            }
        ],
        "connections": {
            "Poll New Orders": {"main": [[{"node": "Generate Invoice PDF", "type": "main", "index": 0}]]},
            "Generate Invoice PDF": {"main": [[{"node": "Email Invoice", "type": "main", "index": 0}]]},
            "Email Invoice": {"main": [[{"node": "Mark as Processed", "type": "main", "index": 0}]]}
        }
    },
    
    "Bulk QR Code Generation": {
        "name": "Bulk QR Code Generation",
        "nodes": [
            {
                "parameters": {
                    "path": "/qr-requests",
                    "triggerOn": "fileCreated"
                },
                "name": "Watch for CSV",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [250, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "functionCode": "const csv = $input.item.binary.data.toString();\\nconst lines = csv.split('\\\\n').filter(l => l.trim());\\nreturn lines.map(line => ({json: {text_content: line}}));"
                },
                "name": "Parse CSV Lines",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/qr-generator/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "bodyParametersJson": "={\"text_content\": \"{{$json.text_content}}\"}"
                },
                "name": "Generate QR Code",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [650, 300]
            },
            {
                "parameters": {
                    "toEmail": "admin@company.com",
                    "subject": "QR Codes Generated",
                    "text": "={{$json.length}} QR codes generated successfully."
                },
                "name": "Email Notification",
                "type": "n8n-nodes-base.emailSend",
                "typeVersion": 2,
                "position": [850, 300],
                "credentials": {"smtp": {"id": "4", "name": "SMTP Account"}}
            }
        ],
        "connections": {
            "Watch for CSV": {"main": [[{"node": "Parse CSV Lines", "type": "main", "index": 0}]]},
            "Parse CSV Lines": {"main": [[{"node": "Generate QR Code", "type": "main", "index": 0}]]},
            "Generate QR Code": {"main": [[{"node": "Email Notification", "type": "main", "index": 0}]]}
        }
    },
    
    "Server Log Auto-Emailer": {
        "name": "Server Log Auto-Emailer",
        "nodes": [
            {
                "parameters": {
                    "rule": {"interval": [{"triggerAtHour": 23, "triggerAtMinute": 59}]}
                },
                "name": "Schedule (11:59 PM)",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [250, 300]
            },
            {
                "parameters": {
                    "path": "/var/log/app.log",
                    "binaryPropertyName": "log_data"
                },
                "name": "Read Log File",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [450, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "functionCode": "const log = $input.item.binary.log_data.toString();\\nreturn [{json: {logs_text: log}}];"
                },
                "name": "Extract Text",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [650, 300]
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/text-to-email/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "bodyParametersJson": "={\"logs_text\": \"{{$json.logs_text}}\"}"
                },
                "name": "Format Logs",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [850, 300]
            },
            {
                "parameters": {
                    "toEmail": "admin@company.com",
                    "subject": "=Daily Server Logs - {{$now.format('YYYY-MM-DD')}}",
                    "text": "={{$json.output}}"
                },
                "name": "Email Logs",
                "type": "n8n-nodes-base.emailSend",
                "typeVersion": 2,
                "position": [1050, 300],
                "credentials": {"smtp": {"id": "4", "name": "SMTP Account"}}
            }
        ],
        "connections": {
            "Schedule (11:59 PM)": {"main": [[{"node": "Read Log File", "type": "main", "index": 0}]]},
            "Read Log File": {"main": [[{"node": "Extract Text", "type": "main", "index": 0}]]},
            "Extract Text": {"main": [[{"node": "Format Logs", "type": "main", "index": 0}]]},
            "Format Logs": {"main": [[{"node": "Email Logs", "type": "main", "index": 0}]]}
        }
    },
    
    "Auto-Report Generation": {
        "name": "Auto-Report Generation",
        "nodes": [
            {
                "parameters": {
                    "rule": {"interval": [{"triggerAtDayofWeek": 1, "triggerAtHour": 9}]}
                },
                "name": "Schedule (Monday 9 AM)",
                "type": "n8n-nodes-base.scheduleTrigger",
                "typeVersion": 1,
                "position": [250, 300]
            },
            {
                "parameters": {
                    "functionCode": "return [{json: {html_content: '<h1>Weekly Report</h1><p>Report for week ' + new Date().toISOString().slice(0,10) + '</p>'}}];"
                },
                "name": "Generate HTML",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/html-to-pdf/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "bodyParametersJson": "={\"html_content\": \"{{$json.html_content}}\"}"
                },
                "name": "Convert to PDF",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [650, 300]
            },
            {
                "parameters": {
                    "path": "=/reports/weekly_{{$now.format('YYYY-MM-DD')}}.pdf",
                    "binaryData": True,
                    "binaryPropertyName": "data"
                },
                "name": "Archive PDF",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [850, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            }
        ],
        "connections": {
            "Schedule (Monday 9 AM)": {"main": [[{"node": "Generate HTML", "type": "main", "index": 0}]]},
            "Generate HTML": {"main": [[{"node": "Convert to PDF", "type": "main", "index": 0}]]},
            "Convert to PDF": {"main": [[{"node": "Archive PDF", "type": "main", "index": 0}]]}
        }
    },
    
    "Webhook JSON to SQL": {
        "name": "Webhook JSON to SQL",
        "nodes": [
            {
                "parameters": {
                    "path": "webhook-data",
                    "responseMode": "responseNode",
                    "options": {}
                },
                "name": "Webhook Trigger",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [250, 300],
                "webhookId": "webhook-json-sql"
            },
            {
                "parameters": {
                    "functionCode": "const payload = $input.item.json.body;\\nreturn [{json: {json_text: JSON.stringify(payload)}}];"
                },
                "name": "Validate JSON",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/json-to-sql/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "bodyParametersJson": "={\"json_text\": \"{{$json.json_text}}\"}"
                },
                "name": "Generate SQL",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [650, 300]
            },
            {
                "parameters": {
                    "operation": "executeQuery",
                    "query": "={{$json.output}}"
                },
                "name": "Execute SQL",
                "type": "n8n-nodes-base.mysql",
                "typeVersion": 1,
                "position": [850, 300],
                "credentials": {"mysql": {"id": "3", "name": "MySQL DB"}}
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": "={\"success\": true, \"message\": \"Data inserted successfully\"}"
                },
                "name": "Respond",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [1050, 300]
            }
        ],
        "connections": {
            "Webhook Trigger": {"main": [[{"node": "Validate JSON", "type": "main", "index": 0}]]},
            "Validate JSON": {"main": [[{"node": "Generate SQL", "type": "main", "index": 0}]]},
            "Generate SQL": {"main": [[{"node": "Execute SQL", "type": "main", "index": 0}]]},
            "Execute SQL": {"main": [[{"node": "Respond", "type": "main", "index": 0}]]}
        }
    },
    
    "Auto-Rename FTP Files": {
        "name": "Auto-Rename FTP Files",
        "nodes": [
            {
                "parameters": {
                    "path": "/uploads",
                    "triggerOn": "fileCreated"
                },
                "name": "Watch Upload Folder",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [250, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "operation": "list",
                    "path": "/uploads"
                },
                "name": "List All Files",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [450, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "functionCode": "const files = $input.all().map(i => i.json.name).join('\\\\n');\\nreturn [{json: {file_list_text: files}}];"
                },
                "name": "Build File List",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [650, 300]
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/bulk-renamer/execute",
                    "method": "POST",
                    "jsonParameters": True,
                    "bodyParametersJson": "={\"file_list_text\": \"{{$json.file_list_text}}\"}"
                },
                "name": "Generate Rename Map",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [850, 300]
            }
        ],
        "connections": {
            "Watch Upload Folder": {"main": [[{"node": "List All Files", "type": "main", "index": 0}]]},
            "List All Files": {"main": [[{"node": "Build File List", "type": "main", "index": 0}]]},
            "Build File List": {"main": [[{"node": "Generate Rename Map", "type": "main", "index": 0}]]}
        }
    },
    
    "Auto-Watermark Workflow": {
        "name": "Auto-Watermark Workflow",
        "nodes": [
            {
                "parameters": {
                    "path": "/photos/incoming",
                    "triggerOn": "fileCreated"
                },
                "name": "Watch Photo Folder",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [250, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            },
            {
                "parameters": {
                    "url": "http://backend:8000/tools/image-watermarker/execute-file",
                    "method": "POST",
                    "sendBinaryData": True,
                    "binaryPropertyName": "data",
                    "options": {}
                },
                "name": "Apply Watermark",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "path": "=/photos/published/{{$json.filename}}",
                    "binaryData": True,
                    "binaryPropertyName": "data"
                },
                "name": "Publish to FTP",
                "type": "n8n-nodes-base.ftp",
                "typeVersion": 1,
                "position": [650, 300],
                "credentials": {"ftp": {"id": "1", "name": "FTP Account"}}
            }
        ],
        "connections": {
            "Watch Photo Folder": {"main": [[{"node": "Apply Watermark", "type": "main", "index": 0}]]},
            "Apply Watermark": {"main": [[{"node": "Publish to FTP", "type": "main", "index": 0}]]}
        }
    }
}

async def update_workflows():
    db = SessionLocal()
    client = N8nClient()
    print("🔄 Updating Workflow Templates with Production Implementations...")
    
    for wf_name, wf_data in WORKFLOWS.items():
        print(f"\\n👉 Processing: {wf_name}")
        
        # Find existing workflow in database
        workflow = db.query(WorkflowTemplate).filter(WorkflowTemplate.name == wf_name).first()
        
        if not workflow:
            print(f"   ⚠️ Workflow '{wf_name}' not found in database. Skipping.")
            continue
        
        if not workflow.n8n_workflow_id:
            print(f"   ⚠️ No n8n_workflow_id for '{wf_name}'. Skipping.")
            continue
        
        # Update workflow in n8n
        try:
            print(f"   🔄 Updating in n8n (ID: {workflow.n8n_workflow_id})...")
            await client.update_workflow(workflow.n8n_workflow_id, wf_data)
            print(f"   ✅ Updated in n8n")
            
            # Update in database
            workflow.workflow_json = json.dumps(wf_data)
            db.commit()
            print(f"   ✅ Updated in database")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\\n🏁 Workflow Update Complete!")

if __name__ == "__main__":
    asyncio.run(update_workflows())
