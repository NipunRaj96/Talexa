"""Application schemas for request/response validation"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime


class ApplicationBase(BaseModel):
    """Base application schema"""
    applicant_name: str = Field(..., min_length=1, max_length=255, description="Applicant name")
    applicant_email: EmailStr = Field(..., description="Applicant email")


class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application"""
    job_id: str = Field(..., description="Job ID to apply for")
    # File will be handled separately via multipart/form-data


class ApplicationResponse(ApplicationBase):
    """Schema for application response"""
    id: str
    job_id: str
    resume_url: Optional[str] = None
    skills_extracted: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    education_level: Optional[str] = None
    match_score: Optional[float] = None
    analysis_result: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    @validator('skills_extracted', pre=True)
    def parse_skills(cls, v):
        """Parse skills from JSON string if needed"""
        if isinstance(v, str):
            import json
            return json.loads(v) if v else []
        return v or []
    
    @validator('analysis_result', pre=True)
    def parse_analysis(cls, v):
        """Parse analysis_result from JSON string if needed"""
        if isinstance(v, str):
            import json
            return json.loads(v) if v else None
        return v
    
    @classmethod
    def model_validate(cls, obj):
        """Custom validation to handle SQLAlchemy model"""
        if hasattr(obj, 'to_dict'):
            return cls(**obj.to_dict())
        return super().model_validate(obj)
    
    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """Schema for list of applications"""
    applications: List[ApplicationResponse]
    total: int


class ApplicationAnalysisResponse(BaseModel):
    """Schema for AI analysis result"""
    skills: List[str]
    experience_years: int
    education_level: str
    key_achievements: List[str]
    summary: str
    matched_skills: List[str]
    missing_skills: List[str]
    match_score: float
    match_category: str
