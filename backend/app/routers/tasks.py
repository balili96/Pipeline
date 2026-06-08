from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.task import Task, TaskStatus, Priority
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/projects/{project_id}/tasks", tags=["Tasks"])

@router.get("")
async def list_tasks(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.project_id == project_id))
    tasks = result.scalars().all()
    return [TaskResponse.from_orm_compat(t) for t in tasks]

@router.post("", status_code=201)
async def create_task(project_id: str, data: TaskCreate, db: AsyncSession = Depends(get_db)):
    # Verify project exists
    proj = await db.execute(select(Project).where(Project.id == project_id))
    if not proj.scalar_one_or_none():
        raise HTTPException(404, "Project not found")

    task = Task(
        project_id=project_id,
        title=data.title,
        description=data.description,
        status=TaskStatus(data.status) if data.status else TaskStatus.PLANNED,
        priority=Priority(data.priority) if data.priority else Priority.MEDIUM,
        tags=data.tags,
        assignee=data.assignee or "",
        due_date=data.due_date or "",
        ai_generated=data.ai_generated or False,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return TaskResponse.from_orm_compat(task)

@router.patch("/{task_id}")
async def update_task(project_id: str, task_id: str, data: TaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    task = result.scalar_one_or_none()
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

    await db.commit()
    await db.refresh(task)
    return TaskResponse.from_orm_compat(task)

@router.delete("/{task_id}", status_code=204)
async def delete_task(project_id: str, task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    await db.delete(task)
    await db.commit()
