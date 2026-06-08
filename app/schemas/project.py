from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectList(BaseModel):
    projects: list[ProjectResponse]
    total: int
