
# FlowSaaS V1.0 - Personal SaaS Platform

A powerful, AI-driven SaaS platform built with FastAPI, Next.js, and n8n. Featuring an AI Workflow Generator that builds and deploys automation routines instantly.

## 🚀 Quick Start (New Machine)

### 1. Prerequisite
- Docker & Docker Compose installed.
- Git.

### 2. Environment Setup
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Make sure to fill in `GROQ_API_KEY` or `GEMINI_API_KEY` to enable the AI Generator!

### 3. Build & Launch
```bash
docker-compose up -d --build
```

### 4. Restore Data (Portability)
If you are moving from another machine and have a `backend/data/factory_reset.json` file, run:
```bash
docker-compose exec backend python scripts/restore_everything.py
```
This will:
- Re-import all **Workflow Templates**.
- Re-import all **Free Tools**.
- Re-sync everything to the new **n8n instance**.

---

## 🛠 Project Structure

- **/frontend**: Next.js application (Admin & User panels).
- **/backend**: FastAPI server + AI Engine.
- **/n8n**: Workflow engine container.

## 🤖 AI Workflow Generator

The platform uses a "Double-Block" AI architecture:
1. **Logic Block**: Generates valid n8n JSON nodes and connections.
2. **Schema Block**: Detects required user fields (API Keys, IDs) and maps them automatically.

To use:
1. Go to **Admin > AI Generator**.
2. Type a business requirement.
3. Save & Configure Pricing.
4. Activate for users!

## 📦 Backing Up Your Progress
Before moving to a different laptop or pushing to a new repo, always run:
```bash
docker-compose exec backend python scripts/backup_db_contents.py
```
This updates `backend/data/factory_reset.json` with your latest AI workflows.

---

## 📄 License
Personal Project - 2026
