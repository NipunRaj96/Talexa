"""Job application API endpoints with file upload and AI analysis"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import logging

from ..database import get_db
from ..models.application import Application
from ..models.job import Job
from ..schemas.application import ApplicationResponse, ApplicationListResponse
from ..services.resume_service import ResumeService
from ..services.ai_service import AIService

from ..deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    job_id: str = Form(..., description="Job ID to apply for"),
    applicant_name: str = Form(..., description="Applicant name"),
    applicant_email: str = Form(..., description="Applicant email"),
    resume: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    db: Session = Depends(get_db)
):
    """
    Submit a job application with resume upload and AI analysis (Public)
    
    - **job_id**: UUID of the job to apply for
    - **applicant_name**: Full name of applicant
    - **applicant_email**: Email address
    - **resume**: Resume file (PDF or DOCX, max 5MB)
    """
    try:
        # Validate job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job with ID {job_id} not found"
            )
        
        # Check if job is active
        if job.status.value != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This job posting is closed"
            )
        
        # Initialize services
        resume_service = ResumeService()
        ai_service = AIService()
        
        # Validate file
        resume_service.validate_file(resume)
        
        # Process resume (save and extract text)
        logger.info(f"Processing resume for {applicant_email} applying to job {job_id}")
        resume_url, resume_text = await resume_service.process_resume(
            file=resume,
            job_id=job_id,
            applicant_email=applicant_email
        )
        
        # Prepare job requirements for AI
        job_requirements = {
            "job_title": job.job_title,
            "description": job.description,
            "skills": job.skills,
            "minimum_experience": job.minimum_experience
        }
        
        # Analyze resume with AI
        logger.info(f"Analyzing resume with AI for {applicant_email}")
        analysis_result = await ai_service.analyze_resume(
            resume_text=resume_text,
            job_requirements=job_requirements
        )
        
        # Extract application data from analysis
        application_data = ai_service.extract_application_data(analysis_result)
        
        # Create application record
        new_application = Application(
            job_id=job_id,
            applicant_name=applicant_name,
            applicant_email=applicant_email,
            resume_url=resume_url,
            resume_text=resume_text,
            experience_years=application_data.get("experience_years"),
            education_level=application_data.get("education_level"),
            match_score=application_data.get("match_score")
        )
        
        # Set JSON fields using properties
        new_application.skills_list = application_data.get("skills_extracted", [])
        new_application.analysis_dict = application_data.get("analysis_result", {})
        
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        
        logger.info(
            f"Application created successfully - ID: {new_application.id}, "
            f"Match Score: {new_application.match_score}"
        )
        
        return new_application.to_dict()
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing application: {str(e)}"
        )


@router.get("/", response_model=ApplicationListResponse)
async def get_applications(
    job_id: Optional[UUID] = Query(None, description="Filter by job ID"),
    min_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum match score"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all applications with optional filtering (Recruiters only)
    
    - **job_id**: Filter by specific job
    - **min_score**: Filter by minimum match score (0.0 to 1.0)
    - **skip**: Pagination offset
    - **limit**: Maximum results per page
    """
    query = db.query(Application)
    
    # Apply filters
    if job_id:
        query = query.filter(Application.job_id == job_id)
    
    if min_score is not None:
        query = query.filter(Application.match_score >= min_score)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    applications = query.order_by(
        Application.match_score.desc(),
        Application.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return ApplicationListResponse(applications=applications, total=total)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific application by ID (Recruiters only)
    
    - **application_id**: UUID of the application
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    return application


@router.get("/job/{job_id}/top", response_model=ApplicationListResponse)
async def get_top_candidates(
    job_id: str,
    limit: int = Query(10, ge=1, le=50, description="Number of top candidates"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get top N applications for a job based on match score (Recruiters only)
    
    - **job_id**: UUID of the job
    - **limit**: Number of top candidates to return (default: 10)
    """
    # Validate job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    
    # Get top applications
    applications = db.query(Application).filter(
        Application.job_id == job_id
    ).order_by(
        Application.match_score.desc()
    ).limit(limit).all()
    
    return ApplicationListResponse(
        applications=applications,
        total=len(applications)
    )


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete an application
    
    - **application_id**: UUID of the application to delete
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    try:
        db.delete(application)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting application: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting application: {str(e)}"
        )
