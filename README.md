# 📚 Smart Classroom

A full-stack Learning Management System (LMS) built with **React + Vite** and **Supabase**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Supabase Auth with Teacher / Student roles |
| 📝 Assignments | Create, view, delete assignments (Teacher) |
| 📤 PDF Upload | Students submit PDFs via Supabase Storage |
| ⏰ Late Penalty | Auto 0.5 points/day deduction (configurable per assignment) |
| 🎯 Grading | Teachers award marks with penalty preview & auto-suggest |
| 🌙 Dark Mode | Full dark/light theme toggle |
| 🔔 Toasts | react-hot-toast notifications |
| 📱 Responsive | Mobile-first design |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd smart-classroom
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the entire contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

**First run?** Sign up as a teacher or student. Your role determines available features.

---

## 🗄️ Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK to auth.users |
| name | text | Full name |
| email | text | Unique |
| role | text | `teacher` or `student` |

### `assignments`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | text | Assignment title |
| description | text | Optional details |
| due_date | timestamptz | Deadline |
| max_marks | int | Total possible marks |
| allow_late_submission | boolean | Allow submissions after due date (default: true) |
| created_by | uuid | FK to users (teacher) |

### `submissions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| assignment_id | uuid | FK to assignments |
| student_id | uuid | FK to users |
| file_url | text | Path in Supabase Storage |
| submitted_at | timestamptz | Auto-set |
| marks_awarded | int/float | Set by teacher (can be decimal) |
| is_late | boolean | Computed on submit |
| late_days | int | Days past due |
| deduction_pct | int | Penalty in basis points (50 = 0.5%) |

---

## ⏰ Late Submission Logic

```js
// src/utils/lateSubmission.js
const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24))
const deductionPoints = Math.min(daysLate * 0.5, maxMarks)
// Examples (out of 100):
// 1 day late → 0.5 points off → max 99.5
// 2 days late → 1 point off → max 99
// 100+ days late → capped at 100 points off
```

**Configurable per assignment:** Teachers can disable late submissions via `allow_late_submission` toggle

---

## 📁 Folder Structure

```
smart-classroom/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── common/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── teacher/
│   │   │   ├── AssignmentList.jsx
│   │   │   ├── CreateAssignment.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── ViewSubmissions.jsx
│   │   └── student/
│   │       ├── AssignmentCard.jsx
│   │       ├── StudentDashboard.jsx
│   │       └── UploadSubmission.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── utils/
│   │   └── lateSubmission.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase-schema.sql
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🛠️ Tech Stack

- **React 18** + **Vite**
- **Supabase** (Auth + PostgreSQL + Storage)
- **Tailwind CSS** (Dark mode, custom design system)
- **react-router-dom** v6
- **react-hot-toast**
- **react-icons**
- **date-fns**

---

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Students can only see/modify their own submissions
- Teachers can only manage their own assignments
- PDF-only upload enforced client + storage side
- Role-based protected routing

---

## 📜 License

MIT
