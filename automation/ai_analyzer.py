"""AI-powered resume analyzer using Groq API"""

import os
from groq import Groq
from typing import Dict, List, Optional
import json
import logging

logger = logging.getLogger(__name__)


class AIAnalyzer:
    """Analyze resumes using Groq AI (Llama 3.1)"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize AI analyzer
        
        Args:
            api_key: Groq API key (defaults to GROQ_API_KEY env var)
            model: Model name (defaults to GROQ_MODEL env var or llama-3.1-8b-instant)
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model = model or os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.client = Groq(api_key=self.api_key)
    
    def create_analysis_prompt(
        self,
        resume_text: str,
        job_requirements: Dict[str, any]
    ) -> str:
        """
        Create structured prompt for AI analysis
        
        Args:
            resume_text: Extracted resume text
            job_requirements: Job requirements dict with skills, experience, etc.
            
        Returns:
            Formatted prompt string
        """
        skills_str = ", ".join(job_requirements.get("skills", []))
        
        prompt = f"""You are an expert HR recruiter analyzing resumes. Analyze the following resume and extract structured information.

RESUME TEXT:
{resume_text}

JOB REQUIREMENTS:
- Job Title: {job_requirements.get('job_title', 'N/A')}
- Required Skills: {skills_str}
- Minimum Experience: {job_requirements.get('minimum_experience', 'N/A')}
- Description: {job_requirements.get('description', 'N/A')}

TASK:
Extract and return ONLY a valid JSON object with the following structure (no additional text):
{{
  "skills": ["skill1", "skill2", ...],
  "experience_years": <number>,
  "education_level": "High School/Bachelor's/Master's/PhD/Other",
  "key_achievements": ["achievement1", "achievement2", ...],
  "summary": "Brief 2-3 sentence candidate summary",
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...]
}}

INSTRUCTIONS:
1. Extract ALL technical and soft skills mentioned in the resume
2. Calculate total years of professional experience (return as integer)
3. Identify highest education level
4. List 3-5 key achievements or accomplishments
5. Compare resume skills with required skills
6. List matched skills (skills in both resume and requirements)
7. List missing skills (required skills not found in resume)

Return ONLY the JSON object, no other text."""

        return prompt
    
    async def analyze_resume(
        self,
        resume_text: str,
        job_requirements: Dict[str, any]
    ) -> Dict:
        """
        Analyze resume using Groq AI
        
        Args:
            resume_text: Extracted resume text
            job_requirements: Job requirements dictionary
            
        Returns:
            Analysis results dictionary
        """
        try:
            prompt = self.create_analysis_prompt(resume_text, job_requirements)
            
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR recruiter. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more consistent output
                max_tokens=1500,
            )
            
            # Extract response
            content = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                # Remove markdown code blocks if present
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                    content = content.strip()
                
                analysis_result = json.loads(content)
                
                # Validate required fields
                required_fields = ["skills", "experience_years", "education_level"]
                for field in required_fields:
                    if field not in analysis_result:
                        logger.warning(f"Missing field in AI response: {field}")
                        analysis_result[field] = None if field == "experience_years" else []
                
                return analysis_result
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"Response content: {content}")
                
                # Return fallback structure
                return {
                    "skills": [],
                    "experience_years": 0,
                    "education_level": "Unknown",
                    "key_achievements": [],
                    "summary": "Error parsing AI response",
                    "matched_skills": [],
                    "missing_skills": job_requirements.get("skills", []),
                    "error": str(e)
                }
        
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            raise
    
    def sync_analyze_resume(
        self,
        resume_text: str,
        job_requirements: Dict[str, any]
    ) -> Dict:
        """
        Synchronous version of analyze_resume (for non-async contexts)
        
        Args:
            resume_text: Extracted resume text
            job_requirements: Job requirements dictionary
            
        Returns:
            Analysis results dictionary
        """
        try:
            prompt = self.create_analysis_prompt(resume_text, job_requirements)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR recruiter. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1500,
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```"):
                parts = content.split("```")
                if len(parts) >= 2:
                    content = parts[1]
                    if content.startswith("json"):
                        content = content[4:]
                    content = content.strip()
            
            # Try to parse JSON
            try:
                analysis_result = json.loads(content)
                
                # Validate required fields
                required_fields = ["skills", "experience_years", "education_level"]
                for field in required_fields:
                    if field not in analysis_result:
                        logger.warning(f"Missing field in AI response: {field}")
                        if field == "experience_years":
                            analysis_result[field] = 0
                        elif field == "skills":
                            analysis_result[field] = []
                        else:
                            analysis_result[field] = "Unknown"
                
                return analysis_result
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                logger.error(f"Response content: {content[:500]}")  # Log first 500 chars
                
                # Return fallback structure
                return {
                    "skills": [],
                    "experience_years": 0,
                    "education_level": "Unknown",
                    "key_achievements": [],
                    "summary": "Error parsing AI response",
                    "matched_skills": [],
                    "missing_skills": job_requirements.get("skills", []),
                }
            
        except Exception as e:
            logger.error(f"Error in sync_analyze_resume: {e}")
            # Return fallback instead of raising
            return {
                "skills": [],
                "experience_years": 0,
                "education_level": "Unknown",
                "key_achievements": [],
                "summary": f"Error: {str(e)}",
                "matched_skills": [],
                "missing_skills": job_requirements.get("skills", []),
            }


# Example usage
if __name__ == "__main__":
    analyzer = AIAnalyzer()
    
    sample_resume = """
    John Doe
    Senior Software Engineer
    
    Experience:
    - 5 years at Tech Corp as Full Stack Developer
    - Built scalable APIs using Python and FastAPI
    - Managed PostgreSQL databases
    
    Skills: Python, FastAPI, React, PostgreSQL, Docker
    
    Education: Bachelor's in Computer Science
    """
    
    job_reqs = {
        "job_title": "Backend Developer",
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "minimum_experience": "3+ years"
    }
    
    result = analyzer.sync_analyze_resume(sample_resume, job_reqs)
    print(json.dumps(result, indent=2))
