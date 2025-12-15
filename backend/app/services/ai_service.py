"""AI analysis service"""

import sys
from pathlib import Path
from typing import Dict
import logging

# Add automation folder to Python path
automation_path = Path(__file__).resolve().parent.parent.parent.parent / "automation"
sys.path.insert(0, str(automation_path))

from ai_analyzer import AIAnalyzer
from matcher import MatchScoreCalculator
from ..config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered resume analysis"""
    
    def __init__(self):
        self.analyzer = AIAnalyzer(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL
        )
        self.matcher = MatchScoreCalculator()
    
    async def analyze_resume(
        self,
        resume_text: str,
        job_requirements: Dict
    ) -> Dict:
        """
        Analyze resume using AI and calculate match score
        
        Args:
            resume_text: Extracted resume text
            job_requirements: Job requirements dictionary
            
        Returns:
            Complete analysis with match score
        """
        try:
            # Get AI analysis
            analysis_result = self.analyzer.sync_analyze_resume(
                resume_text=resume_text,
                job_requirements=job_requirements
            )
            
            # Calculate match score
            match_score = self.matcher.calculate_match_score(
                analysis_result=analysis_result,
                job_requirements=job_requirements
            )
            
            # Add match score and category to result
            analysis_result['match_score'] = match_score
            analysis_result['match_category'] = self.matcher.get_match_category(match_score)
            
            logger.info(
                f"Resume analyzed - Match Score: {match_score:.2f} "
                f"({analysis_result['match_category']})"
            )
            
            return analysis_result
        
        except Exception as e:
            logger.error(f"Error in AI analysis: {e}")
            raise
    
    def extract_application_data(self, analysis_result: Dict) -> Dict:
        """
        Extract relevant data for application model from AI analysis
        
        Args:
            analysis_result: Complete AI analysis result
            
        Returns:
            Dictionary with fields for Application model
        """
        return {
            "skills_extracted": analysis_result.get("skills", []),
            "experience_years": analysis_result.get("experience_years", 0),
            "education_level": analysis_result.get("education_level", "Unknown"),
            "match_score": analysis_result.get("match_score", 0.0),
            "analysis_result": {
                "summary": analysis_result.get("summary", ""),
                "key_achievements": analysis_result.get("key_achievements", []),
                "matched_skills": analysis_result.get("matched_skills", []),
                "missing_skills": analysis_result.get("missing_skills", []),
                "match_category": analysis_result.get("match_category", ""),
                "analysis_summary": analysis_result.get("summary", "")
            }
        }
