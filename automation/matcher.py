"""Match score calculator - Calculate candidate-job fit score"""

from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class MatchScoreCalculator:
    """Calculate match score between candidate and job requirements"""
    
    # Weights for different factors (must sum to 1.0)
    WEIGHTS = {
        "skills": 0.50,      # 50% - Most important
        "experience": 0.30,  # 30% - Second most important
        "education": 0.20,   # 20% - Least important
    }
    
    @staticmethod
    def calculate_skills_score(
        candidate_skills: List[str],
        required_skills: List[str]
    ) -> float:
        """
        Calculate skills match score
        
        Args:
            candidate_skills: List of skills from resume
            required_skills: List of required skills from job
            
        Returns:
            Score between 0.0 and 1.0
        """
        if not required_skills:
            return 1.0  # If no skills required, perfect match
        
        if not candidate_skills:
            return 0.0  # If candidate has no skills, no match
        
        # Normalize skills (lowercase, strip whitespace)
        candidate_skills_normalized = {s.lower().strip() for s in candidate_skills}
        required_skills_normalized = {s.lower().strip() for s in required_skills}
        
        # Calculate matched skills
        matched_skills = candidate_skills_normalized.intersection(required_skills_normalized)
        
        # Calculate score as percentage of required skills matched
        score = len(matched_skills) / len(required_skills_normalized)
        
        return min(score, 1.0)  # Cap at 1.0
    
    @staticmethod
    def calculate_experience_score(
        candidate_years: int,
        required_experience: str
    ) -> float:
        """
        Calculate experience match score
        
        Args:
            candidate_years: Years of experience from resume
            required_experience: Required experience string (e.g., "3+ years")
            
        Returns:
            Score between 0.0 and 1.0
        """
        if not required_experience or required_experience.lower() == "no experience required":
            return 1.0
        
        # Parse required years from string
        import re
        match = re.search(r'(\d+)', required_experience)
        if not match:
            return 0.5  # If can't parse, give neutral score
        
        required_years = int(match.group(1))
        
        # More generous scoring - exceeding requirements is good!
        if candidate_years >= required_years:
            # Perfect match if meets or exceeds requirement
            # Give bonus for significantly more experience (up to 1.0)
            bonus = min((candidate_years - required_years) * 0.05, 0.2)
            return min(1.0, 0.8 + bonus)
        elif candidate_years >= required_years * 0.75:
            # Good match if within 25% of requirement
            return 0.8
        elif candidate_years >= required_years * 0.5:
            # Acceptable match if within 50% of requirement
            return 0.6
        elif candidate_years > 0:
            # Some experience is better than none
            return 0.4
        else:
            # No experience
            return 0.2  # Give some credit for applying
    
    @staticmethod
    def calculate_education_score(
        candidate_education: str,
        required_education: str = None
    ) -> float:
        """
        Calculate education match score
        
        Args:
            candidate_education: Education level from resume
            required_education: Required education level (optional)
            
        Returns:
            Score between 0.0 and 1.0
        """
        # Education level hierarchy
        education_levels = {
            "high school": 1,
            "associate": 2,
            "bachelor": 3,
            "bachelor's": 3,
            "master": 4,
            "master's": 4,
            "phd": 5,
            "doctorate": 5,
        }
        
        candidate_level = 0
        for key, value in education_levels.items():
            if key in candidate_education.lower():
                candidate_level = value
                break
        
        # If no specific requirement, score based on having education
        if not required_education:
            return min(candidate_level / 3.0, 1.0)  # Bachelor's = 1.0
        
        required_level = 0
        for key, value in education_levels.items():
            if key in required_education.lower():
                required_level = value
                break
        
        if candidate_level >= required_level:
            return 1.0
        elif candidate_level >= required_level - 1:
            return 0.7
        elif candidate_level > 0:
            return 0.4
        else:
            return 0.0
    
    @classmethod
    def calculate_match_score(
        cls,
        analysis_result: Dict,
        job_requirements: Dict
    ) -> float:
        """
        Calculate overall match score
        
        Args:
            analysis_result: AI analysis results with extracted info
            job_requirements: Job requirements dictionary
            
        Returns:
            Overall match score between 0.0 and 1.0
        """
        try:
            # Calculate individual scores
            skills_score = cls.calculate_skills_score(
                analysis_result.get("skills", []),
                job_requirements.get("skills", [])
            )
            
            experience_score = cls.calculate_experience_score(
                analysis_result.get("experience_years", 0),
                job_requirements.get("minimum_experience", "")
            )
            
            education_score = cls.calculate_education_score(
                analysis_result.get("education_level", ""),
                job_requirements.get("education_level", None)
            )
            
            # Calculate weighted average
            overall_score = (
                skills_score * cls.WEIGHTS["skills"] +
                experience_score * cls.WEIGHTS["experience"] +
                education_score * cls.WEIGHTS["education"]
            )
            
            logger.info(
                f"Match scores - Skills: {skills_score:.2f}, "
                f"Experience: {experience_score:.2f}, "
                f"Education: {education_score:.2f}, "
                f"Overall: {overall_score:.2f}"
            )
            
            return round(overall_score, 2)
        
        except Exception as e:
            logger.error(f"Error calculating match score: {e}")
            return 0.0
    
    @classmethod
    def get_match_category(cls, score: float) -> str:
        """
        Get match category based on score
        
        Args:
            score: Match score between 0.0 and 1.0
            
        Returns:
            Category string
        """
        if score >= 0.8:
            return "Excellent Match"
        elif score >= 0.6:
            return "Good Match"
        elif score >= 0.4:
            return "Fair Match"
        else:
            return "Poor Match"


# Example usage
if __name__ == "__main__":
    calculator = MatchScoreCalculator()
    
    analysis = {
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "experience_years": 5,
        "education_level": "Bachelor's in Computer Science"
    }
    
    job_reqs = {
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "minimum_experience": "3+ years",
        "education_level": "Bachelor's"
    }
    
    score = calculator.calculate_match_score(analysis, job_reqs)
    category = calculator.get_match_category(score)
    
    print(f"Match Score: {score:.2f} ({category})")
