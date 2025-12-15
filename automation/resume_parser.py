"""Resume parser - Extract text from PDF and DOCX files"""

import PyPDF2
import pdfplumber
from docx import Document
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class ResumeParser:
    """Parse resume files and extract text content"""
    
    @staticmethod
    def extract_from_pdf(file_path: Path) -> str:
        """
        Extract text from PDF file using pdfplumber (better for complex PDFs)
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Extracted text content
        """
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF with pdfplumber: {e}")
            # Fallback to PyPDF2
            return ResumeParser._extract_pdf_pypdf2(file_path)
    
    @staticmethod
    def _extract_pdf_pypdf2(file_path: Path) -> str:
        """Fallback PDF extraction using PyPDF2"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF with PyPDF2: {e}")
            raise ValueError(f"Could not extract text from PDF: {e}")
    
    @staticmethod
    def extract_from_docx(file_path: Path) -> str:
        """
        Extract text from DOCX file
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Extracted text content
        """
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX: {e}")
            raise ValueError(f"Could not extract text from DOCX: {e}")
    
    @staticmethod
    def extract_from_doc(file_path: Path) -> str:
        """
        Extract text from DOC file (legacy format)
        Note: Requires additional libraries like antiword or conversion
        """
        # For now, raise an error - DOC format requires special handling
        raise NotImplementedError(
            "Legacy .doc format not supported. Please convert to .docx or .pdf"
        )
    
    @classmethod
    def parse_resume(cls, file_path: Path) -> str:
        """
        Parse resume file and extract text based on file extension
        
        Args:
            file_path: Path to resume file
            
        Returns:
            Extracted text content
            
        Raises:
            ValueError: If file format is not supported
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        extension = file_path.suffix.lower()
        
        if extension == '.pdf':
            return cls.extract_from_pdf(file_path)
        elif extension == '.docx':
            return cls.extract_from_docx(file_path)
        elif extension == '.doc':
            return cls.extract_from_doc(file_path)
        else:
            raise ValueError(
                f"Unsupported file format: {extension}. "
                "Supported formats: .pdf, .docx"
            )
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean extracted text by removing extra whitespace and formatting
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        # Remove multiple newlines
        text = "\n".join(line.strip() for line in text.split("\n") if line.strip())
        
        # Remove multiple spaces
        import re
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()


# Example usage
if __name__ == "__main__":
    parser = ResumeParser()
    
    # Test with a sample file
    try:
        text = parser.parse_resume(Path("sample_resume.pdf"))
        cleaned_text = parser.clean_text(text)
        print(f"Extracted {len(cleaned_text)} characters")
        print(cleaned_text[:500])  # Print first 500 chars
    except Exception as e:
        print(f"Error: {e}")
