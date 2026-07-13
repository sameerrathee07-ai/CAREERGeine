# CareerGenie

An AI-powered resume analyzer and intelligent job matching platform built to bridge the gap between job seekers and recruiters.

---

## What It Is

CareerGenie is a full-stack web application that helps students analyze their resumes, identify skill gaps, and discover perfectly matched job opportunities. Recruiters can post jobs, manage applicants, and track hiring workflows. The platform uses AI and NLP to provide intelligent resume scoring and personalized job recommendations.

---

## How It Works

**For Students:**
1. Sign up and upload your resume
2. AI analyzes your resume for ATS compatibility, keyword optimization, and content quality
3. View your resume score, ATS score, and AI-generated feedback
4. Discover job recommendations based on your skills and experience
5. Apply to jobs and track application status in one dashboard

**For Recruiters:**
1. Sign up and create job postings
2. View applicants and their resume scores
3. Manage application status (pending, under-review, accepted, rejected)
4. Track hiring workflow from posting to hiring

**For Admins:**
1. Monitor all users and job postings
2. View platform analytics and metrics

---

## Key Features

### Resume Intelligence
- AI-powered resume analysis with multi-dimensional scoring (ATS, content, keywords)
- Automated skill and experience extraction
- PDF parsing and storage via Cloudinary
- Resume version history tracking
- AI-generated feedback and recommendations

### Intelligent Job Matching
- Semantic similarity matching between resumes and jobs
- Skill-gap analysis with personalized recommendations
- Personalized job discovery based on profile alignment
- Saved jobs and application tracking

### Recruiter Portal
- Create, edit, and manage job postings
- Advanced applicant filtering and sorting
- Application status workflow management
- Company profile management

### Authentication & Security
- Role-based access control (Student, Recruiter, Admin)
- JWT authentication with secure password hashing
- Protected routes and endpoints
- CORS protection and rate limiting

---

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, React Query, React Router, Axios, Framer Motion

**Backend:** Node.js, Express.js, MongoDB Atlas, JWT, bcrypt, Cloudinary, pdf-parse, natural (TF-IDF)

**AI:** Google Generative AI / Groq for resume feedback and analysis

**Deployment:** Vercel (Frontend), Render (Backend)

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB and Cloudinary credentials to .env
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## Architecture

**Backend:** Controller → Service → Repository → Database  
**AI Layer:** Abstract provider for easy swapping between LLM providers

**Design Principles:** SOLID, DRY, KISS, Feature-based architecture

---

## Deployment

**Frontend:** Vercel (auto-deploys on git push)  
**Backend:** Render (auto-deploys on git push)  
**Database:** MongoDB Atlas (free tier)

---

## License

MIT License - feel free to use this project for learning and portfolio purposes.

---

**Built as an internship project | July 2026**
