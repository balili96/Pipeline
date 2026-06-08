from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.task import Task, TaskStatus, Priority
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/projects/{project_id}/tasks", tags=["Tasks"])

@router.get("")
def list_tasks(project_id: str, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    return [TaskResponse.from_orm_compat(t) for t in tasks]

@router.post("", status_code=201)
def create_task(project_id: str, data: TaskCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    task = Task(
        project_id=project_id,
        title=data.title,
        description=data.description or "",
        status=TaskStatus(data.status) if data.status else TaskStatus.PLANNED,
        priority=Priority(data.priority) if data.priority else Priority.MEDIUM,
        tags=data.tags or "",
        assignee=data.assignee or "",
        due_date=data.due_date or "",
        ai_generated=data.ai_generated or False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.from_orm_compat(task)

@router.patch("/{task_id}")
def update_task(project_id: str, task_id: str, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(404, "Task not found")

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.status is not None:
        task.status = TaskStatus(data.status)
    if data.priority is not None:
        task.priority = Priority(data.priority)
    if data.tags is not None:
        task.tags = data.tags
    if data.assignee is not None:
        task.assignee = data.assignee
    if data.due_date is not None:
        task.due_date = data.due_date
    if data.progress is not None:
        task.progress = data.progress

    db.commit()
    db.refresh(task)
    return TaskResponse.from_orm_compat(task)

@router.delete("/{task_id}", status_code=204)
def delete_task(project_id: str, task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task)
    db.commit()
