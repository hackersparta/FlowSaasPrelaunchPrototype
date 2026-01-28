import asyncio
import json
import sys
import os
import base64

# Add parent directory to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import FreeTool, WorkflowTemplate
from app.services.n8n_client import N8nClient

# Common Python Tool Templates
PYTHON_CSV_TO_MYSQL = """
import pandas as pd
import io

def run(input_file):
    try:
        df = pd.read_csv(io.BytesIO(input_file))
        # Generate Create Table SQL
        columns = df.columns
        table_name = "imported_data"
        create_sql = f"CREATE TABLE {table_name} ("
        for col in columns:
            create_sql += f"{col} TEXT, "
        create_sql = create_sql.strip(", ") + ");"
        
        # Generate Insert SQLs
        insert_sqls = []
        for index, row in df.iterrows():
            vals = [f"'{str(val)}'" for val in row.values]
            insert_sqls.append(f"INSERT INTO {table_name} VALUES ({', '.join(vals)});")
            
        return {"output": create_sql + "\\n" + "\\n".join(insert_sqls)}
    except Exception as e:
        return {"error": str(e)}
"""

PYTHON_API_TO_CSV = """
import requests
import pandas as pd
import io

def run(api_url):
    try:
        response = requests.get(api_url)
        data = response.json()
        
        if isinstance(data, dict):
            # Try to find the list inside
            for key, value in data.items():
                if isinstance(value, list):
                    data = value
                    break
        
        if not isinstance(data, list):
             return {"error": "API response is not a list"}
             
        df = pd.DataFrame(data)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        
        return {
            "output": csv_buffer.getvalue().encode('utf-8'),
            "filename": "api_data.csv",
            "mime_type": "text/csv"
        }
    except Exception as e:
        return {"error": str(e)}
"""

PYTHON_INVOICE_GEN = """
from fpdf import FPDF
import io

def run(client_name, amount, currency="USD", invoice_number="INV-001"):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="INVOICE", ln=1, align="C")
    pdf.cell(200, 10, txt=f"Invoice Number: {invoice_number}", ln=1, align="L")
    pdf.cell(200, 10, txt=f"Client: {client_name}", ln=1, align="L")
    pdf.cell(200, 10, txt=f"Amount: {currency} {amount}", ln=1, align="L")
    
    pdf_buffer = pdf.output(dest='S').encode('latin-1')
    return {
        "output": pdf_buffer,
        "filename": f"invoice_{invoice_number}.pdf",
        "mime_type": "application/pdf"
    }
"""

PYTHON_QR_GEN = """
import qrcode
import io

def run(text_content):
    img = qrcode.make(text_content)
    buf = io.BytesIO()
    img.save(buf)
    return {
        "output": buf.getvalue(),
        "filename": "qrcode.png",
        "mime_type": "image/png"
    }
"""

PYTHON_TEXT_TO_EMAIL = """
def run(logs_text):
    # This is a mock since actual email sending happens in n8n/backend worker
    # In a real tool this might format it nicely or just validate
    return {"output": f"Prepared email body with {len(logs_text)} chars.\\nPreview:\\n{logs_text[:100]}..."}
"""

PYTHON_HTML_TO_PDF = """
from fpdf import FPDF

class HTML2PDF(FPDF):
    def write_html(self, text):
        self.set_font('Arial', '', 12)
        self.multi_cell(0, 5, text)

def run(html_content):
    pdf = HTML2PDF()
    pdf.add_page()
    pdf.write_html(html_content)
    pdf_buffer = pdf.output(dest='S').encode('latin-1')
    return {
        "output": pdf_buffer,
        "filename": "converted.pdf",
        "mime_type": "application/pdf"
    }
"""

PYTHON_JSON_TO_SQL = """
import json

def run(json_text):
    try:
        data = json.loads(json_text)
        if not isinstance(data, list): data = [data]
        
        sqls = []
        for row in data:
            cols = row.keys()
            vals = [f"'{str(v)}'" for v in row.values()]
            sqls.append(f"INSERT INTO table_name ({', '.join(cols)}) VALUES ({', '.join(vals)});")
            
        return {"output": "\\n".join(sqls)}
    except Exception as e:
        return {"error": str(e)}
"""

PYTHON_FILE_RENAMER = """
# Logic only return rename mapping
def run(file_list_text):
    # Mock: input represents a list of filenames separated by newline
    files = file_list_text.split('\\n')
    renamed = []
    for i, f in enumerate(files):
        ext = f.split('.')[-1] if '.' in f else ''
        renamed.append(f"{f} -> file_{i+100}.{ext}")
    return {"output": "\\n".join(renamed)}
"""

PYTHON_WATERMARK = """
from PIL import Image, ImageDraw, ImageFont
import io

def run(input_file, watermark_text="CONFIDENTIAL"):
    try:
        base = Image.open(io.BytesIO(input_file)).convert("RGBA")
        txt = Image.new("RGBA", base.size, (255,255,255,0))
        d = ImageDraw.Draw(txt)
        # simplistic font logic
        d.text((10,10), watermark_text, fill=(255,255,255,128))
        
        out = Image.alpha_composite(base, txt)
        buf = io.BytesIO()
        out.convert("RGB").save(buf, format="JPEG")
        
        return {
            "output": buf.getvalue(),
            "filename": "watermarked.jpg",
            "mime_type": "image/jpeg"
        }
    except Exception as e:
        return {"error": str(e)}
"""


# Tools Definition
TOOLS = [
    {
        "name": "CSV to MySQL Importer",
        "slug": "csv-to-mysql",
        "description": "Convert CSV files into MySQL CREATE and INSERT statements automatically.",
        "category": "Database Tools",
        "icon": "🐬",
        "input_type": "file",
        "output_type": "text",
        "code": PYTHON_CSV_TO_MYSQL,
        "content": {
            "inputs": [{"name": "input_file", "label": "Upload CSV", "type": "file"}],
            "features": ["Auto-detect schema", "Generate INSERT statements", "Handle large CSVs"],
            "how_to": ["Upload CSV", "Copy SQL output", "Run in your DB"],
            "pain_point": "Writing SQL manually for CSV data?",
            "solution": "Auto-sync CSV file -> MySQL every hour (n8n)"
        },
        "workflow": {
            "name": "Auto-Sync CSV to MySQL",
            "nodes": [], # Placeholder, n8n client will handle basic struct if empty or we mock it
            "description": "Watch folder for CSVs and auto-insert to Database."
        }
    },
    {
        "name": "API Response to CSV",
        "slug": "api-to-csv",
        "description": "Fetch JSON data from any API and convert it to a CSV file.",
        "category": "Developer Tools",
        "icon": "🔌",
        "input_type": "text",
        "output_type": "file",
        "code": PYTHON_API_TO_CSV,
        "content": {
            "inputs": [{"name": "api_url", "label": "API URL", "type": "text", "placeholder": "https://api.example.com/users"}],
            "features": ["Support REST APIs", "Flatten nested JSON", "Download as CSV"],
            "how_to": ["Enter API URL", "Click Convert", "Download CSV"],
            "pain_point": "Scraping API data manually?",
            "solution": "Auto-fetch API -> CSV -> FTP server daily"
        },
        "workflow": {
            "name": "Daily API Backup to CSV", 
            "nodes": [], 
            "description": "Fetch API data daily and save as CSV."
        }
    },
    {
        "name": "Invoice Generator",
        "slug": "invoice-generator",
        "description": "Create professional PDF invoices instantly.",
        "category": "Business Tools",
        "icon": "🧾",
        "input_type": "text",
        "output_type": "file",
        "code": PYTHON_INVOICE_GEN,
        "content": {
            "inputs": [
                {"name": "client_name", "label": "Client Name", "type": "text"},
                {"name": "amount", "label": "Amount", "type": "number"},
                {"name": "currency", "label": "Currency", "type": "text", "defaultValue": "USD"},
                {"name": "invoice_number", "label": "Inv #", "type": "text", "defaultValue": "INV-001"}
            ],
            "features": ["PDF Export", "Custom Currency", "Instant Generation"],
            "how_to": ["Fill details", "Generate", "Download PDF"],
            "pain_point": "Creating invoices in Word manually?",
            "solution": "Auto-generate invoice from MySQL order data"
        },
         "workflow": {
            "name": "Auto-Generate Invoice from Database", 
            "nodes": [], 
            "description": "Trigger on new DB order -> Generate Invoice -> Email Client."
        }
    },
    {
        "name": "QR Code Generator",
        "slug": "qr-generator",
        "description": "Generate high-quality QR codes for links or text.",
        "category": "Business Tools",
        "icon": "📱",
        "input_type": "text",
        "output_type": "file",
        "code": PYTHON_QR_GEN,
        "content": {
            "inputs": [{"name": "text_content", "label": "URL or Text", "type": "text"}],
            "features": ["High Res PNG", "Supports URLs", "Instant"],
            "how_to": ["Enter Text", "Generate", "Download"],
            "pain_point": "Creating QR codes one by one?",
            "solution": "Auto-generate 100 QR codes from CSV -> Zip"
        },
        "workflow": {
            "name": "Bulk QR Code Generation", 
            "nodes": [], 
            "description": "Read CSV -> Generate QRs -> Zip -> Email"
        }
    },
    {
        "name": "Text Log to Email Body",
        "slug": "text-to-email",
        "description": "Format raw text logs into a readable email body.",
        "category": "Utility",
        "icon": "📧",
        "input_type": "text",
        "output_type": "text",
        "code": PYTHON_TEXT_TO_EMAIL,
        "content": {
             "inputs": [{"name": "logs_text", "label": "Logs Content", "type": "textarea"}],
             "features": ["Clean formatting", "Prepares for SMTP"],
             "pain_point": "Sending server logs manually?",
             "solution": "Auto-email server logs every night (SMTP)"
        },
        "workflow": {
            "name": "Server Log Auto-Emailer", 
            "nodes": [], 
            "description": "Read Log File -> Format -> Email Admin"
        }
    },
    {
        "name": "HTML to PDF Converter",
        "slug": "html-to-pdf",
        "description": "Convert HTML code or snippets into PDF documents.",
        "category": "Converter",
        "icon": "📄",
        "input_type": "text",
        "output_type": "file",
        "code": PYTHON_HTML_TO_PDF,
        "content": {
            "inputs": [{"name": "html_content", "label": "HTML Code", "type": "textarea"}],
            "features": ["Render HTML", "Save as PDF"],
            "pain_point": "Converting reports manually?",
            "solution": "Auto-convert HTML reports -> PDF -> FTP"
        },
        "workflow": {
            "name": "Auto-Report Generation", 
            "nodes": [], 
            "description": "Generate HTML Report -> Convert to PDF -> Archive"
        }
    },
    {
        "name": "JSON to SQL INSERT",
        "slug": "json-to-sql",
        "description": "Convert JSON data into SQL INSERT statements.",
        "category": "Developer Tools",
        "icon": "💾",
        "input_type": "text",
        "output_type": "text",
        "code": PYTHON_JSON_TO_SQL,
         "content": {
            "inputs": [{"name": "json_text", "label": "JSON Data", "type": "textarea"}],
            "features": ["Batch Inserts", "Handle Arrays"],
            "pain_point": "Writing INSERT queries manually?",
            "solution": "Auto-convert JSON -> SQL batch inserts"
        },
        "workflow": {
            "name": "Webhook JSON to SQL", 
            "nodes": [], 
            "description": "Webhook -> Validate -> SQL Insert"
        }
    },
    {
        "name": "Bulk File Renamer Helper",
        "slug": "bulk-renamer",
        "description": "Generate rename mapping logic for lists of files.",
        "category": "File Ops",
        "icon": "🏷️",
        "input_type": "text",
        "output_type": "text",
        "code": PYTHON_FILE_RENAMER,
        "content": {
            "inputs": [{"name": "file_list_text", "label": "File List (one per line)", "type": "textarea"}],
            "features": ["Smart Pattern Matching", "Preview New Names"],
            "pain_point": "Renaming files manually?",
            "solution": "Auto-rename files: IMG_001.jpg -> product-red.jpg"
        },
        "workflow": {
            "name": "Auto-Rename FTP Files", 
            "nodes": [], 
            "description": "Watch Folder -> Rename matching pattern -> Move"
        }
    },
    {
        "name": "Image Watermarker",
        "slug": "image-watermarker",
        "description": "Add text watermarks to images instantly.",
        "category": "Image Tools",
        "icon": "©️",
        "input_type": "file",
        "output_type": "file",
        "code": PYTHON_WATERMARK,
         "content": {
            "inputs": [
                {"name": "input_file", "label": "Image", "type": "file"},
                {"name": "watermark_text", "label": "Watermark Text", "type": "text", "defaultValue": "CONFIDENTIAL"}
            ],
            "features": ["Transparent Text", "Protect your IP"],
            "pain_point": "Adding watermarks manually?",
            "solution": "Auto-watermark photos in folder -> SFTP"
        },
        "workflow": {
            "name": "Auto-Watermark Workflow", 
            "nodes": [], 
            "description": "New Image -> Apply Watermark -> Publish"
        }
    }
]

async def seed():
    db = SessionLocal()
    client = N8nClient()
    print("🚀 Starting Mass Tool Seeding...")
    
    for t in TOOLS:
        print(f"👉 Processing: {t['name']}")
        
        # 1. Create/Update Tool
        existing = db.query(FreeTool).filter(FreeTool.slug == t['slug']).first()
        content_str = json.dumps(t['content'])
        
        if existing:
            existing.python_code = t['code']
            existing.content_json = content_str
            # update other fields if needed
        else:
            new_tool = FreeTool(
                name=t['name'],
                slug=t['slug'],
                description=t['description'],
                category=t['category'],
                icon=t['icon'],
                input_type=t['input_type'],
                output_type=t['output_type'],
                python_code=t['code'],
                content_json=content_str,
                is_active=True,
                seo_title=f"{t['name']} - Free Online Tool",
                seo_description=t['description'],
                seo_keywords=f"{t['slug'].replace('-', ' ')}, free tool, online",
                usage_count=0
            )
            db.add(new_tool)
        
        # 2. Create/Update Workflow Template
        wf_name = t['workflow']['name']
        existing_wf = db.query(WorkflowTemplate).filter(WorkflowTemplate.name == wf_name).first()
        
        # Simple Mock Workflow JSON (minimal valid n8n)
        wf_json = {
            "name": wf_name,
            "nodes": [
                {
                    "parameters": {},
                    "name": "Start",
                    "type": "n8n-nodes-base.start",
                    "typeVersion": 1,
                    "position": [250, 300]
                },
                {
                     "parameters": {"content": f"Automated step for {t['name']}"},
                     "name": "Log Action",
                     "type": "n8n-nodes-base.noOp", 
                     "typeVersion": 1,
                     "position": [450, 300]
                }
            ],
            "connections": {
                "Start": {"main": [[{"node": "Log Action", "type": "main", "index": 0}]]}
            }
        }
        
        wf_str = json.dumps(wf_json)
        
        if not existing_wf:
            new_wf = WorkflowTemplate(
                name=wf_name,
                description=t['workflow']['description'],
                category=t['category'],
                workflow_json=wf_str,
                is_free=False,
                credits_per_run=5,
                is_active=True
            )
            db.add(new_wf)
            db.flush() # get ID
            
            # Sync to n8n
            try:
                print(f"   Creating Workflow in n8n: {wf_name}")
                n8n_res = await client.create_workflow(wf_json)
                new_wf.n8n_workflow_id = n8n_res['id']
                print(f"   ✅ Created in n8n (ID: {n8n_res['id']})")
            except Exception as e:
                print(f"   ⚠️ Failed to sync n8n: {e}")
                
        db.commit()

    print("🏁 Mass Seeding Complete!")

if __name__ == "__main__":
    asyncio.run(seed())
