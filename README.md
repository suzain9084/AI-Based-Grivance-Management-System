# AI-Based Grievance Management System

An end-to-end grievance management platform for educational institutions. Students can submit complaints via text or voice (with speech-to-text), and the system uses AI to classify grievances into the correct committee. Admins get dashboards, analytics, and committee-wise reports.

The project uses a **modular Flask backend** (user, grievance, and admin apps sharing one MySQL database) with a React frontend. ML inference (speech-to-text and zero-shot classification) runs inside the grievance service.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Services](#backend-services)
- [ML & AI Pipeline](#ml--ai-pipeline)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [Configuration](#configuration)
- [Frontend Routes](#frontend-routes)

---

## Features

### Student (User)
- Register and log in with hashed passwords
- Submit grievances with title, description, and optional voice recording
- **Speech-to-text** — record audio and auto-fill the description field
- **AI committee classification** — grievances are routed to the correct committee automatically when not manually assigned
- View personal grievance history and status
- Personal dashboard with stat cards and KPI reports (resolution rate, response time)
- Profile management

### Admin
- Separate admin login and role-based UI
- View and manage all grievances across committees
- Dashboard with category-wise charts, stat cards, and line graphs
- Filter grievances by status and time range

### System
- Three Flask services started from a single runner (`apprunner.py`)
- Shared SQLAlchemy models and one MySQL database
- Multi-language support (English, Hindi, Marathi, Gujarati) for speech and classification

---

## Architecture

![System architecture](docs/architecture.svg)

```mermaid
flowchart TB
    subgraph Client
        FE[React Frontend<br/>Vite + MUI]
    end

    subgraph Backend
        US[User App :5000]
        GS[Grievance App :5001]
        AS[Admin App :5002]
        ML[ML Models<br/>in-process library]
    end

    subgraph External
        GEMINI[Google Gemini API]
        GSR[Google Speech Recognition]
    end

    subgraph Data
        DB[(MySQL<br/>grievance_management_system_db)]
    end

    FE -->|HTTP :5000| US
    FE -->|HTTP :5001| GS
    FE -->|HTTP :5002| AS
    GS --> ML
    ML --> GEMINI
    ML --> GSR
    US --> DB
    GS --> DB
    AS --> DB
```

### Request Flow (Submit Grievance)

```mermaid
sequenceDiagram
    participant FE as React Frontend
    participant GS as Grievance App :5001
    participant ML as ML Models (in-process)
    participant GEMINI as Google Gemini
    participant GSR as Google Speech
    participant DB as MySQL

    FE->>GS: POST /speechToText (WAV)
    GS->>ML: speechTotext()
    ML->>GSR: recognize_google
    GSR-->>ML: transcript
    ML-->>GS: text
    GS-->>FE: description auto-fill

    FE->>GS: POST /add_grievance (multipart)
    alt no committee selected
        GS->>ML: grievance_classification()
        opt language is not English
            ML->>GEMINI: translate to English
            GEMINI-->>ML: English text
        end
        ML-->>GS: committee label / c_id
    end
    GS->>DB: insert grievance + audio blob
    DB-->>GS: saved row
    GS-->>FE: 200 OK
```

1. Student fills the form on the React frontend and optionally records voice.
2. Frontend sends `POST http://127.0.0.1:5001/add_grievance` (multipart) to the **Grievance App**.
3. If no committee is manually selected, the grievance controller calls `MLmodelsClass.grievance_classification`.
4. Non-English text is translated with **Google Gemini**, then classified with **BART-large-MNLI**.
5. Grievance is stored in MySQL with audio blob, committee ID, and metadata.

### Layer Pattern (Backend)

Each Flask app follows a consistent structure:

```
app/
├── app.py              # Flask app entry point
├── routes/             # HTTP route definitions
├── controller/         # Request handling
├── services/           # Business logic
└── view/               # Response formatting (JSON)
```

Shared code lives in `backend/shared/` (SQLAlchemy models, DB helpers, Flask-Migrate). ML lives in `backend/ML_Models/` and is imported directly by the grievance controller.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 6, React Router 7, Material UI 7, Tailwind CSS 4, Recharts |
| **Backend** | Python 3.12, Flask 3, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS |
| **ML / AI** | Transformers (BART MNLI), Google Speech Recognition, Google Gemini |
| **Database** | MySQL (PyMySQL) |
| **Auth** | Werkzeug password hashing (`pbkdf2:sha256`); session stored in `localStorage` |

---

## Project Structure

```
AI-Based-Grivance-Management-System/
├── src/                          # React frontend
│   ├── page/                     # Route pages (login, dashboard, grievance, admin)
│   ├── components/               # Reusable UI components
│   ├── context/                  # React context (user session)
│   ├── css/                      # Stylesheets
│   └── utils/                    # Frontend helpers
├── backend/
│   ├── apprunner.py              # Starts user, grievance, and admin apps
│   ├── user_app/                 # User registration & profile (:5000)
│   ├── grievance_app/            # Grievance CRUD, speech-to-text (:5001)
│   ├── admin_app/                # Admin operations & dashboards (:5002)
│   ├── ML_Models/                # Speech-to-text & classification
│   ├── shared/                   # Models, DB utils, migrations
│   ├── config/                   # MySQL URL and Python interpreter path
│   └── requirements.txt
├── package.json
├── vite.config.js
└── README.md
```

---

## Backend Services

| Service | Port | Responsibility |
|---------|------|----------------|
| **User App** | 5000 | Student signup, login, profile update, user stat cards, KPI reports |
| **Grievance App** | 5001 | Add/list grievances, speech-to-text, audio retrieval, AI classification |
| **Admin App** | 5002 | Admin signup/login, all grievances, category reports, dashboards |

The frontend calls each service directly (no API gateway on this branch). All three apps share the same MySQL database via `backend/config/config.py`.

A microservices variant (API gateway, separate databases, JWT, RabbitMQ notifications) lives on the `micro-service-architecture` branch.

---

## ML & AI Pipeline

### 1. Speech-to-Text
- **Endpoint:** `POST /speechToText` (Grievance App)
- Converts recorded audio (WAV) to text using Google Speech Recognition
- Supports language codes: `en-IN`, `hi-IN`, `mr-IN`, `gu-IN`

### 2. Committee Classification
- Called in-process from `GrievanceController.add_grievance`
- Uses **Facebook BART-large-MNLI** zero-shot classification
- Candidate committees:
  - Examination
  - Infrastructure
  - General Facility
  - Research Facility
  - Journals/Literature
  - Fellowship
- Non-English text is first translated to English via **Google Gemini 1.5 Flash** before classification

### 3. Grievance Submission Logic
When a student submits a grievance:
1. If a committee is manually selected → use that committee
2. Otherwise → ML classifies the description and assigns `c_id` automatically

---

## Database Design

A single MySQL database (default name `grievance_management_system_db`) holds all tables.

### User
| Column | Type | Description |
|--------|------|-------------|
| u_id | INT PK | User ID |
| student_id | VARCHAR | Unique student ID (login identifier) |
| full_name, email, phone | VARCHAR | Profile fields |
| password | VARCHAR | Hashed password |
| department, year | VARCHAR | Academic info |

### Grievance
| Column | Type | Description |
|--------|------|-------------|
| g_id | INT PK | Grievance ID |
| u_id | INT FK | Submitting user |
| c_id | INT FK | Committee ID |
| title, desc | VARCHAR/TEXT | Complaint content |
| audio | LONGBLOB | Voice recording |
| language | VARCHAR | Submission language |
| status | VARCHAR | e.g. Pending, Resolved |
| time_stamp, updated_at | DATETIME | Timestamps |

### Committee
| c_id | c_name | address | email | phone |

Predefined committees: Examination (1), Infrastructure (2), General Facility (3), Research Facility (4), Journals/Literature (5), Fellowship (6).

### Admin
| Column | Type | Description |
|--------|------|-------------|
| admin_id | INT PK | Admin ID (login identifier) |
| full_name, email, phone | VARCHAR | Profile fields |
| password | VARCHAR | Hashed password |
| c_id | INT FK | Assigned committee |
| created_at | DATETIME | Created timestamp |

---

## API Reference

The frontend talks to each service on its own port.

### User App (`http://127.0.0.1:5000`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Student registration |
| POST | `/login` | Student login (`student_id` + `password`) |
| PUT | `/update` | Update profile |
| GET | `/get_data_statcard/{u_id}` | User stat card |
| GET | `/grievance/kpi_report/{u_id}` | User KPI report |

### Grievance App (`http://127.0.0.1:5001`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/add_grievance` | Submit grievance (multipart) |
| POST | `/speechToText` | Convert audio to text |
| GET | `/get_all_grievance/{user_id}` | User's grievances |
| GET | `/get_audio/{g_id}` | Download grievance audio |

### Admin App (`http://127.0.0.1:5002`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Admin registration |
| POST | `/login` | Admin login (`admin_id` + `password`) |
| PUT | `/update` | Update admin profile |
| GET | `/get_all_grievance` | All grievances |
| GET | `/grievanceCategory/{status}/{time_range}` | Category breakdown |
| GET | `/get_data_statcard` | Dashboard stat card |
| GET | `/get_line_graph_data/{time_range}` | Line graph data |

---

## Authentication

- Passwords are hashed with Werkzeug (`pbkdf2:sha256`)
- Login returns a JSON user/admin object (no JWT on this branch)
- Frontend stores the object in `localStorage` via `UserContext`
- Role-based UI uses `User.isAdmin` (`true` for admins, `false` for students)

---

## Prerequisites

- **Python** 3.12+
- **Node.js** 18+ and npm
- **MySQL** 8+
- **Google Gemini API key** (for non-English translation in ML pipeline)
- Microphone access in browser (for voice grievance feature)

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/suzain9084/AI-Based-Grivance-Management-System.git
cd AI-Based-Grivance-Management-System
```

### 2. Create the MySQL database

```sql
CREATE DATABASE grievance_management_system_db;
```

### 3. Configure the backend

Edit `backend/config/config.py`:

- `connection_string` — SQLAlchemy URL, e.g. `mysql+pymysql://USER:PASSWORD@localhost/grievance_management_system_db` (URL-encode special characters in the password)
- `python_dir` — path to the Python executable used by `apprunner.py` (for example your venv `python.exe` on Windows)

Set your Gemini API key in `backend/ML_Models/MLmodel.py` (`genai.configure(api_key=...)`).

### 4. Install backend dependencies

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
```

### 5. Run database migrations

From the `backend` directory, with `FLASK_APP` pointing at the shared app:

```bash
set FLASK_APP=shared/app.py
flask db upgrade
```

On macOS/Linux use `export FLASK_APP=shared/app.py`.

Seed the six committees (`c_id` 1–6) if they are not created by a migration.

### 6. Install frontend dependencies

```bash
cd ..   # back to project root
npm install
```

---

## Running the Project

### Start all backend services

```bash
cd backend
python apprunner.py
```

This launches:
- User App (5000)
- Grievance App (5001)
- Admin App (5002)

Press `Ctrl+C` to stop.

You can also start a service individually:

```bash
cd backend
python user_app/app.py
python grievance_app/app.py
python admin_app/app.py
```

### Start frontend dev server

In a separate terminal:

```bash
npm run dev
```

Open the URL shown by Vite (typically http://localhost:5173).

---

## Configuration

Backend settings live in `backend/config/config.py`.

| Setting | Description |
|---------|-------------|
| `python_dir` | Interpreter path used by `apprunner.py` |
| `connection_string` | Shared MySQL SQLAlchemy URL |

Frontend API calls currently target `http://127.0.0.1:5000`, `:5001`, and `:5002` directly.

---

## Frontend Routes

| Path | Role | Page |
|------|------|------|
| `/login` | All | Login |
| `/signup` | All | Registration |
| `/` | User / Admin | Home / Complaint list |
| `/addGrievance` | User | Submit new grievance |
| `/dashboard` | User / Admin | Analytics dashboard |
| `/profile` | User / Admin | Profile settings |
| `/settings` | User | App settings |

Role-based rendering is handled in `App.jsx` using `User.isAdmin` from context.

---

## Development Notes

- **First ML request** may be slow while Hugging Face downloads the BART model (~1.6 GB).
- **Audio format:** frontend converts WebM recordings to WAV before sending to speech-to-text.
- **CORS:** enabled on each Flask app for local development.
- **`apprunner.py`** uses Windows-style paths (`grievance_app\\app.py`). On macOS/Linux, start each `app.py` directly or adjust those paths.
- A fuller **microservices** layout (gateway on `:8080`, JWT, RabbitMQ, notification service) is documented on the `micro-service-architecture` branch.

---

## License

This project is part of a software engineering coursework / institutional grievance system. Update licensing as appropriate for your organization.
