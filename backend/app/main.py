from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routers import auth, executions, admin, templates, payments, tools, admin_tools, automations, ai_workflows, ai_tools, restore_endpoint

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables
    print("System Startup: Initializing services...")
    from .database import engine, Base
    from .models import User, WorkflowInstance, RateLimit, Execution, CreditTransaction, UserCredential, WorkflowTemplate, FreeTool, AutomationRun
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    print("System Shutdown")

app = FastAPI(title="FlowSaaS API", version="0.1.0", lifespan=lifespan)

# CORS Configuration - Enhanced for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://frontend:3000",
        # Allow Vercel Frontend (Add your actual Vercel domain later or use *)
        "https://*.vercel.app",
        "https://flowsaas-iota.vercel.app",
        "https://flowsaas-frontend.vercel.app",
        # Allow Render Backend (Self)
        "https://*.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Allow frontend to read all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include API routers
app.include_router(auth.router)
app.include_router(executions.router)
app.include_router(admin.router)
app.include_router(templates.router)
app.include_router(payments.router)
app.include_router(tools.router)
app.include_router(admin_tools.router)
app.include_router(automations.router)
app.include_router(ai_workflows.router)
app.include_router(ai_tools.router)
app.include_router(restore_endpoint.router)

@app.get("/")
def read_root():
    return {"status": "online", "service": "FlowSaaS API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
