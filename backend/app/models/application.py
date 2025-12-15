"""Job application model"""

from sqlalchemy import Column, String, Integer, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import json

from ..database import Base


class Application(Base):
    """Job application model"""
    __tablename__ = "job_applications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Applicant information
    applicant_name = Column(String(255), nullable=False)
    applicant_email = Column(String(255), nullable=False, index=True)
    
    # Resume data
    resume_url = Column(Text, nullable=True)
    resume_text = Column(Text, nullable=True)
    
    # Extracted information (stored as JSON strings for SQLite)
    skills_extracted = Column(Text, default="[]", nullable=True)  # JSON array
    experience_years = Column(Integer, nullable=True)
    education_level = Column(String(100), nullable=True)
    
    # AI analysis
    match_score = Column(Float, nullable=True, index=True)  # 0.0 to 1.0
    analysis_result = Column(Text, nullable=True)  # JSON object
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    job = relationship("Job", back_populates="applications")
    
    @property
    def skills_list(self):
        """Get skills as list"""
        if isinstance(self.skills_extracted, str):
            return json.loads(self.skills_extracted) if self.skills_extracted else []
        return self.skills_extracted or []
    
    @skills_list.setter
    def skills_list(self, value):
        """Set skills from list"""
        self.skills_extracted = json.dumps(value) if value else "[]"
    
    @property
    def analysis_dict(self):
        """Get analysis result as dict"""
        if isinstance(self.analysis_result, str):
            return json.loads(self.analysis_result) if self.analysis_result else {}
        return self.analysis_result or {}
    
    @analysis_dict.setter
    def analysis_dict(self, value):
        """Set analysis result from dict"""
        self.analysis_result = json.dumps(value) if value else "{}"
    
    def __repr__(self):
        return f"<Application {self.applicant_name} for Job {self.job_id}>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": str(self.id),
            "job_id": str(self.job_id),
            "applicant_name": self.applicant_name,
            "applicant_email": self.applicant_email,
            "resume_url": self.resume_url,
            "skills_extracted": self.skills_list,
            "experience_years": self.experience_years,
            "education_level": self.education_level,
            "match_score": float(self.match_score) if self.match_score else None,
            "analysis_result": self.analysis_dict,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
