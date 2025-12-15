"""Job posting model"""

from sqlalchemy import Column, String, Integer, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
import json

from ..database import Base


class JobStatus(str, enum.Enum):
    """Job posting status"""
    ACTIVE = "active"
    CLOSED = "closed"


class Job(Base):
    """Job posting model"""
    __tablename__ = "job_postings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    minimum_experience = Column(String(100), nullable=False)
    number_of_vacancies = Column(Integer, nullable=False)
    skills = Column(Text, nullable=False, default="[]")  # Store as JSON string for SQLite
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    
    @property
    def skills_list(self):
        """Get skills as list"""
        if isinstance(self.skills, str):
            return json.loads(self.skills) if self.skills else []
        return self.skills or []
    
    @skills_list.setter
    def skills_list(self, value):
        """Set skills from list"""
        self.skills = json.dumps(value) if value else "[]"
    
    def __repr__(self):
        return f"<Job {self.job_title} ({self.status})>"
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "id": str(self.id),
            "job_title": self.job_title,
            "description": self.description,
            "minimum_experience": self.minimum_experience,
            "number_of_vacancies": self.number_of_vacancies,
            "skills": self.skills_list,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
