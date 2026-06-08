from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "planned"
    priority: Optional[str] = "medium"
    tags: Optional[str] = ""
    assignee: Optional[str] = ""
    due_date: Optional[str] = ""
    ai_generated: Optional[bool] = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    progress: Optional[int] = None

class TaskResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    status: str
    priority: str
    tags: list[str]  # parsed from comma-separated
    assignee: str
    due_date: str
    progress: int
    ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_compat(cls, task):
        return cls(
            id=task.id,
            project_id=task.project_id,
            title=task.title,
            description=task.description or "",
            status=task.status.value if hasattr(task.status, 'value') else task.status,
            priority=task.priority.value if hasattr(task.priority, 'value') else task.priority,
            tags=[t.strip() for t in (task.tags or "").split(",") if t.strip()],
            assignee=task.assignee or "",
            due_date=task.due_date or "",
            progress=task.progress or 0,
            ai_generated=task.ai_generated or False,
            created_at=task.created_at,
        )
