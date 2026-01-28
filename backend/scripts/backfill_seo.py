from app.database import SessionLocal
from app.models import FreeTool, WorkflowTemplate

db = SessionLocal()

print("Backfilling SEO for Free Tools...")
tools = db.query(FreeTool).all()
for tool in tools:
    if not tool.seo_title:
        tool.seo_title = f"{tool.name} - Free Online Tool | FlowSaaS"
    if not tool.seo_description:
        tool.seo_description = f"Use this free online {tool.name} to {tool.name.lower()} instantly. {tool.description or ''} No signup required."
    if not tool.seo_keywords:
        tool.seo_keywords = f"{tool.name}, free tool, online utility, {tool.category}"
    print(f"Updated Tool: {tool.name}")

print("\nBackfilling SEO for Workflow Templates...")
templates = db.query(WorkflowTemplate).all()
for t in templates:
    if not t.seo_title:
        t.seo_title = f"{t.name} - Automated Workflow | FlowSaaS Marketplace"
    if not t.seo_description:
        t.seo_description = f"Download this n8n automation for {t.name}. {t.description or ''}"
    if not t.seo_keywords:
        t.seo_keywords = f"{t.name}, n8n workflow, automation, {t.category}"
    print(f"Updated Template: {t.name}")

db.commit()
print("\nSuccess! All items now have SEO tags.")
