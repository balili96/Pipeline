from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    doc_type: str
    title: str
    filename: str
    original_filename: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentGenerate(BaseModel):
    doc_type: str  # pmp, requirements, test_script, deploy_plan, user_manual
    title: Optional[str] = None
