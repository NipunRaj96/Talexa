# Talexa - Complete Project Analysis

## 📋 Executive Summary

**Talexa** is an AI-powered recruitment platform that automates resume analysis and candidate matching. The project uses a modern full-stack architecture with FastAPI backend, React frontend, and AI-powered analysis using Groq (Llama 3.3).

---

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - React 18 + TypeScript                                    │
│  - Vite Build System                                        │
│  - Tailwind CSS + Shadcn UI                                 │
│  - Supabase Auth Integration                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────────┐
│                    Backend (FastAPI)                        │
│  - Python 3.11 + FastAPI                                    │
│  - SQLAlchemy ORM                                           │
│  - Supabase PostgreSQL                                      │
│  - JWT Authentication                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              AI/ML Services (Automation)                    │
│  - Resume Parser (PDF/DOCX)                                 │
│  - Groq AI Analyzer (Llama 3.3)                            │
│  - Match Score Calculator                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure & File Analysis

### Root Directory

```
talexa/
├── automation/          # AI/ML services
├── backend/             # FastAPI backend
├── frontend/           # React frontend
├── README.md           # Project documentation
├── vercel.json         # Vercel deployment config
└── .gitignore          # Git ignore rules
```

---

## 🔧 Backend Structure (`/backend`)

### Core Architecture

**Technology Stack:**
- **Framework**: FastAPI 0.109.0
- **Database**: PostgreSQL (via Supabase) with SQLAlchemy ORM
- **Authentication**: Supabase Auth (JWT tokens)
- **File Storage**: Supabase Storage
- **AI Integration**: Groq API (Llama 3.3)

### Directory Breakdown

```
backend/
├── api/
│   └── index.py                    # Vercel serverless entry point
├── app/
│   ├── main.py                     # FastAPI app initialization (⚠️ INCOMPLETE)
│   ├── config.py                   # Environment configuration
│   ├── database.py                 # Database connection & session management
│   ├── deps.py                     # Dependency injection (auth)
│   ├── models/                     # SQLAlchemy models
│   │   ├── job.py                  # Job posting model
│   │   ├── application.py          # Application model
│   │   └── user.py                 # User model (for future use)
│   ├── schemas/                    # Pydantic schemas (validation)
│   │   ├── job.py                  # Job request/response schemas
│   │   └── application.py           # Application schemas
│   ├── routers/                    # API route handlers
│   │   ├── jobs.py                 # Job CRUD endpoints
│   │   └── applications.py          # Application endpoints
│   ├── services/                   # Business logic layer
│   │   ├── ai_service.py           # AI analysis orchestration
│   │   └── resume_service.py       # Resume processing & storage
│   └── utils/
│       └── auth.py                 # JWT utilities (legacy, not used)
└── requirements.txt                # Python dependencies
```

### Key Files Analysis

#### 1. `app/main.py` ⚠️ **CRITICAL ISSUE**
**Status**: **INCOMPLETE** - Missing FastAPI app initialization

**Current State:**
- Imports FastAPI but never creates `app` instance
- References `app.include_router()` without defining `app`
- Missing CORS middleware setup
- Missing database initialization

**What it should have:**
```python
app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)
app.add_middleware(CORSMiddleware, ...)
init_db()
```

**Impact**: Application will not run without fixing this.

#### 2. `app/config.py`
**Purpose**: Centralized configuration management using Pydantic Settings

**Key Settings:**
- Database: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- AI: `GROQ_API_KEY`, `GROQ_MODEL` (default: "llama-3.1-8b-instant")
- Auth: `JWT_SECRET_KEY`, `GOOGLE_CLIENT_ID/SECRET`
- File Upload: Max 5MB, allowed types: PDF, DOCX, DOC
- CORS: Configurable allowed origins

**Compatibility**: Works with both SQLite (dev) and PostgreSQL (prod)

#### 3. `app/database.py`
**Purpose**: Database connection and session management

**Features:**
- SQLAlchemy engine with connection pooling
- Session factory for dependency injection
- `get_db()` generator for FastAPI dependencies
- `init_db()` for table creation
- Supports SQLite (dev) and PostgreSQL (prod)

**Models Registered:**
- `Job` (job_postings table)
- `Application` (job_applications table)
- `User` (users table - for future use)

#### 4. `app/models/job.py`
**Purpose**: Job posting database model

**Schema:**
- `id`: UUID (string)
- `job_title`: String(255)
- `description`: Text (optional)
- `minimum_experience`: String(100)
- `number_of_vacancies`: Integer
- `skills`: JSON string (stored as Text for SQLite compatibility)
- `status`: Enum (ACTIVE/CLOSED)
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- One-to-many with `Application` (cascade delete)

**Properties:**
- `skills_list`: Getter/setter for JSON skills array

#### 5. `app/models/application.py`
**Purpose**: Job application database model

**Schema:**
- `id`: UUID
- `job_id`: Foreign key to Job
- `applicant_name`, `applicant_email`: Applicant info
- `resume_url`: Supabase Storage URL
- `resume_text`: Extracted text (for re-analysis)
- `skills_extracted`: JSON array
- `experience_years`: Integer
- `education_level`: String
- `match_score`: Float (0.0-1.0)
- `analysis_result`: JSON object (full AI analysis)

**Relationships:**
- Many-to-one with `Job`

#### 6. `app/routers/jobs.py`
**Purpose**: Job posting API endpoints

**Endpoints:**
- `POST /api/jobs` - Create job (Protected)
- `GET /api/jobs` - List jobs (Public, with filtering)
- `GET /api/jobs/{id}` - Get job (Public)
- `PUT /api/jobs/{id}` - Update job (Protected)
- `PATCH /api/jobs/{id}/status` - Update status (Protected)
- `DELETE /api/jobs/{id}` - Delete job (Protected)

**Features:**
- Pagination support
- Status filtering
- JWT authentication via `get_current_user` dependency

#### 7. `app/routers/applications.py`
**Purpose**: Application submission and management

**Endpoints:**
- `POST /api/applications` - Submit application with resume (Public)
- `GET /api/applications` - List applications (Protected, with filters)
- `GET /api/applications/{id}` - Get application (Protected)
- `GET /api/applications/job/{job_id}/top` - Top candidates (Protected)
- `DELETE /api/applications/{id}` - Delete application (Protected)

**Workflow:**
1. Validate job exists and is active
2. Validate and save resume to Supabase Storage
3. Extract text from resume
4. Run AI analysis via `AIService`
5. Calculate match score
6. Store application with analysis results

#### 8. `app/services/ai_service.py`
**Purpose**: Orchestrates AI analysis workflow

**Dependencies:**
- `automation/ai_analyzer.py` - Groq AI integration
- `automation/matcher.py` - Match score calculation

**Methods:**
- `analyze_resume()`: Complete analysis pipeline
- `extract_application_data()`: Maps AI results to DB fields

**Flow:**
```
Resume Text → AI Analyzer → Match Calculator → Structured Result
```

#### 9. `app/services/resume_service.py`
**Purpose**: Resume file handling and text extraction

**Features:**
- File validation (type, size)
- Supabase Storage upload
- Text extraction via `ResumeParser`
- Temporary file cleanup

**Methods:**
- `save_resume()`: Upload to Supabase Storage
- `extract_text()`: Parse PDF/DOCX
- `process_resume()`: Complete workflow
- `validate_file()`: File validation

#### 10. `app/deps.py`
**Purpose**: FastAPI dependency injection for authentication

**Function:**
- `get_current_user()`: Verifies JWT token with Supabase
- Uses HTTPBearer security scheme
- Returns user object or raises 401

**Note**: Currently uses Supabase service key for token verification.

---

## 🤖 Automation Module (`/automation`)

### Purpose
Standalone AI/ML services that can be used independently or by the backend.

### Files

#### 1. `resume_parser.py`
**Purpose**: Extract text from resume files

**Supported Formats:**
- PDF (primary: pdfplumber, fallback: PyPDF2)
- DOCX (python-docx)
- DOC (not implemented - raises NotImplementedError)

**Methods:**
- `parse_resume()`: Main entry point
- `extract_from_pdf()`: PDF extraction
- `extract_from_docx()`: DOCX extraction
- `clean_text()`: Text normalization

**Dependencies:**
- `pdfplumber`, `PyPDF2`, `python-docx`

#### 2. `ai_analyzer.py`
**Purpose**: AI-powered resume analysis using Groq

**Model**: Llama 3.1 8B Instant (configurable)

**Features:**
- Structured prompt engineering
- JSON response parsing
- Error handling with fallback responses
- Both async and sync methods

**Analysis Output:**
```json
{
  "skills": ["Python", "FastAPI", ...],
  "experience_years": 5,
  "education_level": "Bachelor's",
  "key_achievements": [...],
  "summary": "...",
  "matched_skills": [...],
  "missing_skills": [...]
}
```

**Error Handling:**
- JSON parsing errors → fallback structure
- API errors → graceful degradation

#### 3. `matcher.py`
**Purpose**: Calculate candidate-job match score

**Algorithm:**
Weighted scoring system:
- **Skills**: 50% weight
- **Experience**: 30% weight
- **Education**: 20% weight

**Scoring Logic:**
- Skills: Percentage of required skills matched
- Experience: Parses "X+ years" and compares
- Education: Hierarchical level matching

**Match Categories:**
- Excellent Match: ≥0.8
- Good Match: ≥0.6
- Fair Match: ≥0.4
- Poor Match: <0.4

---

## 🎨 Frontend Structure (`/frontend`)

### Technology Stack

**Core:**
- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.1
- React Router 6.26.2

**UI Libraries:**
- Tailwind CSS 3.4.11
- Shadcn UI (Radix UI components)
- Lucide React (icons)
- Framer Motion (animations - mentioned in README)

**State Management:**
- React Query (TanStack Query) 5.56.2
- React Context (AuthContext)

**Authentication:**
- Supabase JS 2.87.1

### Directory Structure

```
frontend/
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root component with routing
│   ├── pages/                      # Page components
│   │   ├── Index.tsx               # Landing page
│   │   ├── Login.tsx               # Authentication page
│   │   ├── Dashboard.tsx            # Recruiter dashboard
│   │   ├── CreateJob.tsx           # Job creation form
│   │   ├── EditJob.tsx             # Job editing
│   │   ├── ApplyJob.tsx            # Application submission
│   │   └── NotFound.tsx            # 404 page
│   ├── components/                 # Reusable components
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Route protection
│   │   ├── home/                   # Home page components
│   │   ├── layout/                 # Layout components
│   │   └── ui/                     # Shadcn UI components (50+)
│   ├── context/
│   │   └── AuthContext.tsx         # Authentication state
│   ├── hooks/                      # Custom React hooks
│   │   ├── useJobs.ts              # Jobs data fetching
│   │   ├── useApplications.ts      # Applications data
│   │   └── use-mobile.tsx          # Responsive hook
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API client
│   │   ├── api-config.ts           # API endpoints
│   │   ├── supabase.ts             # Supabase client
│   │   └── utils.ts                 # Helper functions
│   └── integrations/
│       └── supabase/
│           ├── client.ts            # Supabase setup
│           └── types.ts             # TypeScript types
├── public/                         # Static assets
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite configuration
└── tailwind.config.ts              # Tailwind configuration
```

### Key Files Analysis

#### 1. `src/App.tsx`
**Purpose**: Root component with routing and providers

**Structure:**
- QueryClientProvider (React Query)
- AuthProvider (Supabase auth)
- React Router setup
- Toast notifications (Sonner)

**Routes:**
- `/` - Landing page (public)
- `/login` - Authentication (public)
- `/dashboard` - Recruiter dashboard (protected)
- `/create-job` - Create job (protected)
- `/edit-job/:jobId` - Edit job (protected)
- `/apply/:jobId` - Apply to job (public)

#### 2. `src/lib/api.ts`
**Purpose**: API client for backend communication

**Features:**
- TypeScript interfaces for type safety
- Automatic JWT token injection
- Error handling
- Separate APIs for Jobs and Applications

**Methods:**
- `jobsApi`: create, getAll, getById, update, updateStatus, delete
- `applicationsApi`: submit, getAll, getByJob, getTopCandidates, getById

#### 3. `src/context/AuthContext.tsx`
**Purpose**: Authentication state management

**Features:**
- Session management
- User state
- Auth methods: `signInWithGoogle()`, `signInWithEmail()`, `signOut()`
- Auto-sync with Supabase auth state

**Usage:**
```tsx
const { session, user, signInWithGoogle } = useAuth();
```

#### 4. `src/lib/api-config.ts`
**Purpose**: API endpoint configuration

**Configuration:**
- Base URL from `VITE_API_URL` env var (default: localhost:8000)
- Centralized endpoint definitions

---

## 🔗 Component Compatibility & Dependencies

### Backend Dependencies

**Core:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `pydantic` - Data validation
- `supabase` - Database & auth client

**AI/ML:**
- `groq` - AI API client
- `pdfplumber`, `PyPDF2` - PDF parsing
- `python-docx` - DOCX parsing

**Utilities:**
- `python-dotenv` - Environment variables
- `python-multipart` - File uploads
- `python-jose` - JWT (legacy, not actively used)

### Frontend Dependencies

**Core:**
- `react`, `react-dom` - UI framework
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching

**UI:**
- `@radix-ui/*` - 30+ headless UI components
- `tailwindcss` - Styling
- `lucide-react` - Icons

**Auth:**
- `@supabase/supabase-js` - Supabase client

### Inter-Module Dependencies

**Backend → Automation:**
- `app/services/ai_service.py` imports `automation/ai_analyzer.py`
- `app/services/ai_service.py` imports `automation/matcher.py`
- `app/services/resume_service.py` imports `automation/resume_parser.py`

**Frontend → Backend:**
- All API calls via `src/lib/api.ts`
- Uses REST endpoints defined in `api-config.ts`

**Frontend → Supabase:**
- Direct Supabase client for authentication
- Backend uses Supabase for database and storage

---

## ⚠️ Issues & Incompatibilities

### Critical Issues

1. **`backend/app/main.py` - Missing App Initialization**
   - **Problem**: FastAPI app instance is never created
   - **Impact**: Application will crash on startup
   - **Fix Required**: Add app initialization with CORS middleware

2. **Router Registration Issue**
   - **Problem**: `applications_router` is commented out in main.py
   - **Impact**: Application submission endpoints are not accessible
   - **Status**: Router exists but not registered

### Potential Issues

1. **Database Compatibility**
   - Models use JSON strings for SQLite compatibility
   - PostgreSQL would be better with native JSON types
   - Current approach works but is suboptimal

2. **Authentication Inconsistency**
   - Backend uses Supabase service key for token verification
   - Frontend uses Supabase anon key
   - Should verify tokens properly with Supabase auth

3. **Error Handling**
   - Some services catch all exceptions
   - May hide important errors
   - Consider more specific exception handling

4. **File Size Validation**
   - File size check in `resume_service.py` may not work for all upload types
   - Relies on `file.size` attribute which may not exist

---

## 🔄 Data Flow

### Application Submission Flow

```
1. User submits application (frontend)
   ↓
2. POST /api/applications (backend)
   ↓
3. ResumeService.validate_file()
   ↓
4. ResumeService.process_resume()
   ├─→ Save to Supabase Storage
   └─→ ResumeParser.extract_text()
   ↓
5. AIService.analyze_resume()
   ├─→ AIAnalyzer.sync_analyze_resume() (Groq API)
   └─→ MatchScoreCalculator.calculate_match_score()
   ↓
6. Create Application record in database
   ↓
7. Return application with match score
```

### Job Creation Flow

```
1. Recruiter creates job (frontend)
   ↓
2. POST /api/jobs (backend, authenticated)
   ↓
3. Validate request (Pydantic schema)
   ↓
4. Create Job record in database
   ↓
5. Return created job
```

### Authentication Flow

```
1. User clicks "Sign in with Google" (frontend)
   ↓
2. Supabase OAuth redirect
   ↓
3. User authenticates with Google
   ↓
4. Supabase returns session with JWT
   ↓
5. Frontend stores session
   ↓
6. API calls include JWT in Authorization header
   ↓
7. Backend verifies JWT with Supabase (deps.py)
```

---

## 🚀 Deployment Configuration

### Vercel Configuration (`vercel.json`)

**Builds:**
1. Backend: Python serverless function (`backend/api/index.py`)
2. Frontend: Static build (`frontend/dist`)

**Routes:**
- `/api/*` → Backend serverless function
- `/assets/*` → Frontend assets
- `/*.*` → Frontend static files
- `/*` → Frontend index.html (SPA routing)

### Environment Variables Required

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key (for storage)
- `GROQ_API_KEY` - Groq API key
- `JWT_SECRET_KEY` - JWT signing key

**Frontend:**
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

---

## 📊 Database Schema

### Tables

#### `job_postings`
```sql
- id (UUID, PK)
- job_title (VARCHAR(255))
- description (TEXT)
- minimum_experience (VARCHAR(100))
- number_of_vacancies (INTEGER)
- skills (TEXT) -- JSON string
- status (ENUM: active/closed)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `job_applications`
```sql
- id (UUID, PK)
- job_id (UUID, FK → job_postings.id)
- applicant_name (VARCHAR(255))
- applicant_email (VARCHAR(255))
- resume_url (TEXT)
- resume_text (TEXT)
- skills_extracted (TEXT) -- JSON array
- experience_years (INTEGER)
- education_level (VARCHAR(100))
- match_score (FLOAT)
- analysis_result (TEXT) -- JSON object
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `users` (Defined but not actively used)
```sql
- id (UUID, PK)
- email (VARCHAR(255), UNIQUE)
- full_name (VARCHAR(255))
- google_id (VARCHAR(255), UNIQUE)
- profile_picture (TEXT)
- is_active (BOOLEAN)
- is_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

---

## 🔐 Security Considerations

### Authentication
- JWT tokens via Supabase
- HTTPBearer security scheme
- Token verification on protected routes

### File Upload
- File type validation (PDF, DOCX only)
- File size limits (5MB max)
- Secure storage in Supabase Storage

### API Security
- CORS middleware (configurable origins)
- Protected routes require authentication
- Public routes for job listing and application submission

### Potential Security Issues
1. No rate limiting implemented (config exists but not used)
2. File upload validation could be more robust
3. JWT verification uses service key (should use proper auth verification)

---

## 🧪 Testing Status

**Current State**: No test files found in the repository

**Recommended Tests:**
- Unit tests for AI services
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## 📝 Summary

### Strengths
✅ Modern tech stack (FastAPI, React, TypeScript)
✅ Clean separation of concerns
✅ AI-powered resume analysis
✅ Scalable architecture
✅ Type-safe frontend and backend

### Weaknesses
❌ **Critical**: Missing app initialization in main.py
❌ Applications router not registered
❌ No test coverage
❌ Some error handling could be improved
❌ Database models use JSON strings instead of native JSON types

### Recommendations

1. **Immediate Fixes:**
   - Fix `main.py` to initialize FastAPI app
   - Register applications router
   - Add CORS middleware configuration

2. **Short-term Improvements:**
   - Add comprehensive error handling
   - Implement rate limiting
   - Add logging throughout the application
   - Write unit and integration tests

3. **Long-term Enhancements:**
   - Migrate to PostgreSQL native JSON types
   - Implement proper JWT verification
   - Add monitoring and analytics
   - Implement caching for AI responses
   - Add batch processing for applications

---

## 📚 Technology Versions

**Backend:**
- Python: 3.11
- FastAPI: 0.109.0
- SQLAlchemy: 2.0.25
- Groq: 0.4.1

**Frontend:**
- React: 18.3.1
- TypeScript: 5.5.3
- Vite: 5.4.1
- React Router: 6.26.2

**Infrastructure:**
- Supabase: 2.25.1
- Vercel: Serverless deployment

---

*Analysis completed on: 2025-01-27*
*Project: Talexa - AI-Powered Recruitment Platform*

