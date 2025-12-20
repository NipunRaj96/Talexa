"""Job posting API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..models.job import Job, JobStatus
from ..schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse

from ..deps import get_current_user

router = APIRouter()


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new job posting (Recruiters only)
    
    - **job_title**: Job title
    - **description**: Job description (optional)
    - **minimum_experience**: Required experience
    - **number_of_vacancies**: Number of positions
    - **skills**: List of required skills
    - **status**: Job status (active/closed)
    """
    try:
        # Create new job
        new_job = Job(
            job_title=job_data.job_title,
            description=job_data.description,
            minimum_experience=job_data.minimum_experience,
            number_of_vacancies=job_data.number_of_vacancies,
            status=job_data.status
        )
        # Set skills using the property to ensure JSON serialization
        new_job.skills_list = job_data.skills
        
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        
        return new_job.to_dict()
    
    except Exception as e:
        db.rollback()
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error creating job: {e}\n{error_trace}")  # Log to console for Vercel logs
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating job: {str(e)}"
        )


@router.get("/", response_model=JobListResponse)
async def get_jobs(
    status_filter: Optional[JobStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records"),
    db: Session = Depends(get_db)
):
    """
    Get all job postings with optional filtering (Public)
    
    - **status_filter**: Filter by job status (active/closed)
    - **skip**: Pagination offset
    - **limit**: Maximum results per page
    """
    query = db.query(Job)
    
    # Apply status filter if provided
    if status_filter:
        query = query.filter(Job.status == status_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and get results
    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    
    return JobListResponse(jobs=jobs, total=total)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific job posting by ID (Public)
    
    - **job_id**: UUID of the job
    """
    job = db.query(Job).filter(Job.id == str(job_id)).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    return job


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a job posting (Recruiters only)
    
    - **job_id**: UUID of the job to update
    - All fields are optional
    """
    job = db.query(Job).filter(Job.id == str(job_id)).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    # Update only provided fields
    update_data = job_data.model_dump(exclude_unset=True)
    
    # Handle skills separately if provided
    if 'skills' in update_data:
        job.skills_list = update_data.pop('skills')
    
    for field, value in update_data.items():
        setattr(job, field, value)
    
    try:
        db.commit()
        db.refresh(job)
        return job
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job: {str(e)}"
        )


@router.patch("/{job_id}/status", response_model=JobResponse)
async def update_job_status(
    job_id: UUID,
    new_status: JobStatus,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update job status (active/closed) (Recruiters only)
    
    - **job_id**: UUID of the job
    - **new_status**: New status value
    """
    job = db.query(Job).filter(Job.id == str(job_id)).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    job.status = new_status
    
    try:
        db.commit()
        db.refresh(job)
        return job
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job status: {str(e)}"
        )


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a job posting
    
    - **job_id**: UUID of the job to delete
    
    Note: This will also delete all associated applications (cascade)
    """
    job = db.query(Job).filter(Job.id == str(job_id)).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    try:
        db.delete(job)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )
