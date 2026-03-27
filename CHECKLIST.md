# 🚀 Smart Classroom — Pre-Deployment Checklist

Print this checklist and complete each step before deploying to Vercel.

---

## ✅ Code & Build (Local)

- [ ] **Dependencies installed**
  ```bash
  npm install
  ```

- [ ] **Build passes without errors**
  ```bash
  npm run build
  ```
  Expected: `dist/` folder created with all assets

- [ ] **Preview works locally**
  ```bash
  npm run preview
  ```
  Expected: Site runs at `http://localhost:4173`

- [ ] **No code errors detected**
  - Run: `npm run build` should complete without errors
  - Check: Browser console (F12) has no red errors

---

## ✅ Database (Supabase)

- [ ] **Supabase project created**
  - Go to [supabase.com](https://supabase.com)
  - Create new project or use existing one

- [ ] **Schema deployed to Supabase**
  - Open Supabase SQL Editor
  - Copy entire `supabase-schema.sql` file
  - Paste and run in SQL editor
  - ✓ All tables created without errors

- [ ] **Verify `allow_late_submission` column exists**
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'assignments' 
  ORDER BY ordinal_position;
  ```
  Should see: `title`, `description`, `due_date`, `max_marks`, `allow_late_submission`, `created_by`, etc.

- [ ] **Storage bucket created**
  - Supabase > Storage > verify `submissions` bucket exists
  - Bucket is **private** (not public)
  - MIME types: `application/pdf`

---

## ✅ Environment Variables

- [ ] **Get credentials from Supabase**
  - Supabase Project > Settings > API
  - Copy `Project URL` (e.g., https://xxxxx.supabase.co)
  - Copy `anon` public key

- [ ] **`.env.local` configured**
  ```bash
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  ```
  ⚠️ Never commit `.env.local` (already in `.gitignore`)

- [ ] **Environment variables work locally**
  - Run: `npm run dev`
  - Try signing up — should create user in Supabase > Auth

---

## ✅ Git (Optional but Recommended)

- [ ] **Repository initialized**
  ```bash
  git init
  git add .
  git commit -m "Initial commit: Smart Classroom LMS"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/smart-classroom.git
  git push -u origin main
  ```

- [ ] **Secrets not committed**
  - Verify `.env.local` is in `.gitignore`
  - Run: `git status` — should NOT show `.env.local` or `.env`

---

## ✅ Vercel Setup

- [ ] **Vercel account created**
  - Go to [vercel.com](https://vercel.com)
  - Sign up / Log in

- [ ] **GitHub connected to Vercel** (if using GitHub)
  - Vercel Dashboard > GitHub integration
  - Grant repo access

- [ ] **`vercel.json` exists**
  - File should be in project root
  - Contains build command and env variable placeholders

---

## 🚀 Deployment Steps

### Deploy via Vercel Dashboard

1. **Import project**
   - Vercel Dashboard > "New Project"
   - Select repo from GitHub (or paste GitHub URL)

2. **Configure build**
   - Framework: **Vite** (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Root Directory: `./` (default)
   - ✓ Click "Continue"

3. **Add environment variables**
   - Under "Environment Variables", add:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGc...
     ```
   - ✓ Click "Deploy"

4. **Wait for build**
   - Vercel builds and deploys
   - Takes 1-3 minutes
   - ✓ Green checkmark = success

---

## ✅ Post-Deployment Testing

- [ ] **Open live URL**
  - Vercel provides URL (e.g., `smart-classroom.vercel.app`)
  - Copy and visit in browser

- [ ] **Sign up as teacher**
  - Email: `teacher@example.com`
  - Password: secure password
  - Role: `teacher`
  - ✓ Should log in successfully

- [ ] **Sign up as student**
  - Email: `student@example.com`
  - Password: secure password
  - Role: `student`
  - ✓ Should see student dashboard (empty initially)

- [ ] **Create assignment (as teacher)**
  - Title: "Test Assignment"
  - Due date: tomorrow
  - Max marks: 100
  - ✓ Should appear in assignments list

- [ ] **Submit assignment (as student)**
  - Create or select a PDF file
  - Upload to assignment
  - ✓ Should show "Submitted successfully" toast

- [ ] **Late submission penalty**
  - Create assignment with due date: yesterday
  - Submit PDF as student
  - ✓ Should show "Late Submission" warning with 0.5 point deduction

- [ ] **Grade submission (as teacher)**
  - Go to assignment > "View Submissions"
  - Click "Suggest" button
  - Should show effective max marks (e.g., 99.5 if 1 day late)
  - Enter score (e.g., 99)
  - Click "Save"
  - ✓ Should show success toast and update badge

- [ ] **Verify database writes**
  - Supabase > Table Editor > `submissions`
  - Select latest submission
  - ✓ Check `marks_awarded`, `is_late`, `late_days`, `deduction_pct` are correct

---

## 🐛 If Deployment Fails

### Build errors
```bash
# Clear cache and rebuild locally
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### "Cannot find module" in Vercel
- Check: All imports use correct paths
- Check: No missing dependencies in `package.json`
- Vercel > Build Logs for full error

### 400 errors in production
- Vercel Dashboard > Environment Variables
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check: Supabase project not paused

### Submitting fails silently
- Browser DevTools (F12) > Network > check failed requests
- Common cause: Supabase RLS policies blocking writes
- Verify: `submissions` table policies allow INSERT/UPDATE

---

## 📋 Deployment Checklist Summary

```
Build & Code:     [✓] npm run build passes
Database:         [✓] supabase-schema.sql deployed
Environment:      [✓] Vercel env vars set
GitHub:           [✓] Code pushed (optional)
Live Site:        [✓] Tests pass
Database Writes:  [✓] Supabase records created
```

**You are ready to deploy!** 🎓

---

## 🎯 Final Steps

1. Push code to GitHub (if not done)
2. Go to Vercel Dashboard
3. Click "New Project" > Import Git repo
4. Configure build settings (as shown above)
5. Add environment variables
6. Click "Deploy"
7. Wait for completion (green checkmark)
8. Test live URL with teacher/student accounts
9. **Share with users!**

---

**Questions?** See `DEPLOYMENT.md` for detailed instructions.
