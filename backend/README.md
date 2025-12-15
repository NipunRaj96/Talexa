# Talexa Backend

FastAPI backend for AI-powered resume analysis and recruitment platform.

## Setup

1. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Variables**
Copy `.env.example` to `.env` and fill in the values:
```bash
cp ../.env.example ../.env
```

4. **Run Development Server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   ├── utils/               # Utilities
│   └── middleware/          # Custom middleware
├── tests/                   # Test files
└── requirements.txt         # Dependencies
```

## Development

- **Format code**: `black app/`
- **Lint**: `flake8 app/`
- **Type check**: `mypy app/`
- **Run tests**: `pytest`
