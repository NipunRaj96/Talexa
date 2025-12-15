# Automation - AI/ML Services

This folder contains AI-powered services for resume analysis and matching.

## Services

### Resume Analyzer
- Extract text from PDF/DOCX files
- Use Groq AI (Llama 3.1) for intelligent analysis
- Extract skills, experience, education
- Calculate match scores

## Structure

```
automation/
├── resume_parser.py      # PDF/DOCX text extraction
├── ai_analyzer.py        # Groq AI integration
├── matcher.py            # Match score algorithm
└── requirements.txt      # Python dependencies
```

## Usage

```python
from automation.ai_analyzer import analyze_resume

result = await analyze_resume(
    resume_text="...",
    job_requirements={
        "skills": ["Python", "FastAPI"],
        "experience": "2+ years"
    }
)
```
