"""Resume processing service"""

import sys
import os
from pathlib import Path
from typing import Tuple
import logging
from fastapi import UploadFile
import shutil
import tempfile
from supabase import create_client, Client

# Add automation folder to Python path
automation_path = Path(__file__).resolve().parent.parent.parent.parent / "automation"
sys.path.insert(0, str(automation_path))

from resume_parser import ResumeParser
from ..config import settings

logger = logging.getLogger(__name__)


class ResumeService:
    """Service for handling resume uploads and text extraction"""
    
    def __init__(self):
        self.parser = ResumeParser()
        # Initialize Supabase client with SERVICE KEY for upload permissions
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        self.bucket_name = settings.SUPABASE_STORAGE_BUCKET
    
    async def save_resume(self, file: UploadFile, job_id: str, applicant_email: str) -> Tuple[Path, str]:
        """
        Save uploaded resume file to Supabase Storage
        
        Args:
            file: Uploaded file
            job_id: Job ID
            applicant_email: Applicant email for unique filename
            
        Returns:
            Tuple of (temp_file_path, public_url)
        """
        # Validate file type
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ['.pdf', '.docx', '.doc']:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        # Create unique filename
        safe_email = applicant_email.replace('@', '_').replace('.', '_')
        filename = f"{job_id}/{safe_email}{file_ext}"
        
        # Create temporary file for processing
        temp_dir = tempfile.mkdtemp()
        temp_path = Path(temp_dir) / f"{safe_email}{file_ext}"
        
        try:
            # Save to temp file
            with temp_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Reset file pointer for upload
            file.file.seek(0)
            
            # Upload to Supabase Storage
            logger.info(f"Uploading {filename} to Supabase Storage bucket {self.bucket_name}")
            
            # Read file content
            file_content = file.file.read()
            
            # Upload
            self.supabase.storage.from_(self.bucket_name).upload(
                path=filename,
                file=file_content,
                file_options={"content-type": file.content_type}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(filename)
            
            return temp_path, public_url
        
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            # Cleanup temp file if exists
            if temp_path.exists():
                shutil.rmtree(temp_dir)
            raise
    
    async def extract_text(self, file_path: Path) -> str:
        """
        Extract text from resume file
        
        Args:
            file_path: Path to resume file
            
        Returns:
            Extracted text content
        """
        try:
            text = self.parser.parse_resume(file_path)
            cleaned_text = self.parser.clean_text(text)
            
            if not cleaned_text:
                raise ValueError("No text could be extracted from resume")
            
            return cleaned_text
        
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            raise
    
    async def process_resume(
        self,
        file: UploadFile,
        job_id: str,
        applicant_email: str
    ) -> Tuple[str, str]:
        """
        Complete resume processing: save and extract text
        
        Args:
            file: Uploaded file
            job_id: Job ID
            applicant_email: Applicant email
            
        Returns:
            Tuple of (resume_url, resume_text)
        """
        temp_path = None
        try:
            # Save file (returns temp path and Supabase URL)
            temp_path, resume_url = await self.save_resume(file, job_id, applicant_email)
            
            # Extract text from temp file
            resume_text = await self.extract_text(temp_path)
            
            return resume_url, resume_text
            
        finally:
            # Cleanup temp file
            if temp_path and temp_path.exists():
                try:
                    shutil.rmtree(temp_path.parent)
                except Exception as e:
                    logger.warning(f"Failed to cleanup temp directory: {e}")
    
    def validate_file(self, file: UploadFile) -> None:
        """
        Validate uploaded file
        
        Args:
            file: Uploaded file
            
        Raises:
            ValueError: If file is invalid
        """
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext.lstrip('.') not in settings.allowed_file_types_list:
            raise ValueError(
                f"File type {file_ext} not allowed. "
                f"Allowed types: {', '.join(settings.allowed_file_types_list)}"
            )
        
        # Check file size (if we can get it)
        if hasattr(file, 'size') and file.size:
            if file.size > settings.max_file_size_bytes:
                raise ValueError(
                    f"File size ({file.size} bytes) exceeds maximum "
                    f"({settings.max_file_size_bytes} bytes)"
                )
