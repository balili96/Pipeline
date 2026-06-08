import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class DocType(str, enum.Enum):
    PMP = "pmp"
    REQUIREMENTS = "requirements"
    TEST_SCRIPT = "test_script"
    DEPLOY_PLAN = "deploy_plan"
    USER_MANUAL = "user_manual"

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: f"doc-{uuid.uuid4().hex[:8]}")
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(SAEnum(DocType), nullable=False)
    title = Column(String(300), nullable=False)
    filename = Column(String(300), default="")  # stored file name
    original_filename = Column(String(300), default="")  # uploaded file name
    content = Column(Text, default="")  # extracted/parsed content
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="documents")
