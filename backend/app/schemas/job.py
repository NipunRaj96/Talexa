"""Job schemas for request/response validation"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    """Job status enum"""
    ACTIVE = "active"
    CLOSED = "closed"


class JobBase(BaseModel):
    """Base job schema with common fields"""
    job_title: str = Field(..., min_length=1, max_length=255, description="Job title")
    description: Optional[str] = Field(None, description="Job description")
    minimum_experience: str = Field(..., description="Minimum experience required")
    number_of_vacancies: int = Field(..., gt=0, description="Number of open positions")
    skills: List[str] = Field(..., min_items=1, description="Required skills")
    
    @validator('skills')
    def validate_skills(cls, v):
        """Ensure skills are not empty strings"""
        return [skill.strip() for skill in v if skill.strip()]


class JobCreate(JobBase):
    """Schema for creating a new job"""
    status: JobStatus = Field(default=JobStatus.ACTIVE, description="Job status")


class JobUpdate(BaseModel):
    """Schema for updating a job (all fields optional)"""
    job_title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    minimum_experience: Optional[str] = None
    number_of_vacancies: Optional[int] = Field(None, gt=0)
    skills: Optional[List[str]] = None
    status: Optional[JobStatus] = None
    
    @validator('skills')
    def validate_skills(cls, v):
        """Ensure skills are not empty strings"""
        if v is not None:
            return [skill.strip() for skill in v if skill.strip()]
        return v


class JobResponse(JobBase):
    """Schema for job response"""
    id: str
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    
    @validator('skills', pre=True)
    def parse_skills(cls, v):
        """Parse skills from JSON string if needed"""
        if isinstance(v, str):
            import json
            return json.loads(v) if v else []
        return v
    
    @classmethod
    def model_validate(cls, obj):
        """Custom validation to handle SQLAlchemy model"""
        if hasattr(obj, 'to_dict'):
            return cls(**obj.to_dict())
        return super().model_validate(obj)
    
    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


class JobListResponse(BaseModel):
    """Schema for list of jobs"""
    jobs: List[JobResponse]
    total: int
