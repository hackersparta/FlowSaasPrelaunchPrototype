from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, UUID, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from .database import Base

class ExecutionStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    credits_balance = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    executions = relationship("Execution", back_populates="user")
    automation_runs = relationship("AutomationRun", back_populates="user")
    # workflows = relationship("WorkflowInstance", back_populates="owner")

class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    template_id = Column(String) # Reference to immutable template ID
    is_active = Column(Boolean, default=True)
    n8n_workflow_id = Column(String) # ID in n8n engine

    # owner = relationship("User", back_populates="workflows")
    rate_limit = relationship("RateLimit", uselist=False, back_populates="workflow_instance")

class RateLimit(Base):
    __tablename__ = "rate_limits"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_instance_id = Column(UUID(as_uuid=True), ForeignKey("workflow_instances.id"))
    max_runs_per_day = Column(Integer, default=100)
    current_runs = Column(Integer, default=0)
    reset_at = Column(DateTime(timezone=True))

    workflow_instance = relationship("WorkflowInstance", back_populates="rate_limit")

class Execution(Base):
    __tablename__ = "executions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_instance_id = Column(UUID(as_uuid=True), ForeignKey("workflow_instances.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String, default=ExecutionStatus.PENDING)
    credits_used = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(String, nullable=True)
    n8n_execution_id = Column(String, nullable=True) # To track external sync

    user = relationship("User", back_populates="executions")

class CreditTransaction(Base):
    """
    Append-only ledger for credit history.
    """
    __tablename__ = "credit_transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Integer) # Positive for top-up, Negative for usage
    reference_id = Column(String, nullable=True) # Payment ID or Execution ID
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    balance_after = Column(Integer) # Snapshot of balance for quick auditing

    user = relationship("User", back_populates="transactions")

class UserCredential(Base):
    """
    Stores references to credentials existing in n8n.
    Secrets are NOT stored here, only the ID from n8n.
    """
    __tablename__ = "user_credentials"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    name = Column(String) # Friendly name e.g. "My Personal Slack"
    credential_type = Column(String) # n8n credential type e.g. "slackApi"
    n8n_credential_id = Column(String) # The ID in n8n
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="credentials")

class WorkflowTemplate(Base):
    """
    Stores workflow templates that can be activated by users.
    Admin uploads n8n JSON, configures inputs, and activates for marketplace.
    """
    __tablename__ = "workflow_templates"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    category = Column(String)
    n8n_workflow_id = Column(String, nullable=True)  # ID in our n8n instance after creation
    workflow_json = Column(String)  # Stored JSON from upload
    is_free = Column(Boolean, default=False)
    credits_per_run = Column(Integer, default=0)
    input_schema = Column(String)  # JSON schema for user inputs
    is_active = Column(Boolean, default=False)
    
    # SEO Fields
    seo_title = Column(String, nullable=True)
    seo_description = Column(String, nullable=True)
    seo_keywords = Column(String, nullable=True)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User")

class FreeTool(Base):
    """
    Free tools for SEO traffic generation.
    Each tool is a standalone Python script that can be executed.
    """
    __tablename__ = "free_tools"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(String)
    category = Column(String)  # PDF, Image, Video, Text, Converter, Generator
    icon = Column(String)  # Emoji or icon name
    input_type = Column(String)  # file, text, image, video, none
    output_type = Column(String)  # file, text, json, image, video
    python_code = Column(String)  # The actual tool implementation
    input_schema = Column(String, nullable=True)  # JSON schema for user inputs
    is_active = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    # SEO Fields
    seo_title = Column(String, nullable=True)
    seo_description = Column(String, nullable=True)
    seo_keywords = Column(String, nullable=True)

    # Rich Content (FAQs, Features, etc.)
    content_json = Column(String, nullable=True) # key-value store for FAQs, Features, How-To

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())




class AutomationRun(Base):
    """Tracks simplified automation runs (Google Drive link -> Email results)"""
    __tablename__ = "automation_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    automation_type = Column(String(50), nullable=False)  # 'csv-to-mysql', 'qr-bulk', etc.
    
    # Input
    input_method = Column(String(20), nullable=False)  # 'cloud_link', 'upload', 'text'
    input_url = Column(String)  # Google Drive/Dropbox link
    input_file_path = Column(String)  # For uploads
    input_text = Column(String)  # For manual text input
    
    # Output
    output_method = Column(String(20), nullable=False)  # 'email', 'dashboard', 'download'
    output_email = Column(String(255))
    output_file_path = Column(String)  # Saved result
    
    # Schedule
    schedule_type = Column(String(20), nullable=False, default='once')  # 'once', 'daily', 'weekly'
    schedule_time = Column(String)  # For recurring runs (simplified as string)
    
    # Execution
    status = Column(String(20), default='pending')  # 'pending', 'processing', 'complete', 'failed'
    error_message = Column(String)
    credits_used = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_run_at = Column(DateTime(timezone=True))
    next_run_at = Column(DateTime(timezone=True))
    
    # Metadata
    parameters = Column(String)  # JSON as string for tool-specific params
    
    # Relationship
    user = relationship("User", back_populates="automation_runs")


# Late binding of relationships to avoid circular dependency / definition order issues
User.transactions = relationship("CreditTransaction", back_populates="user")
User.credentials = relationship("UserCredential", back_populates="user")



