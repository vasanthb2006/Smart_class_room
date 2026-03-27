# Smart Classroom — Deployment Guide

Complete checklist to deploy to Vercel with Supabase backend.

---

## ✅ Pre-Deployment Checklist

### 1. **Supabase Setup** (One-time)

Run this SQL in your Supabase Project > SQL Editor:

```sql
-- Copy the entire content from supabase-schema.sql and run it in Supabase SQL Editor
```

**Key tables created:**
- `users` — student & teacher profiles
- `assignments` — assignment details with `allow_late_submission` toggle
- `submissions` — student submissions with late penalty tracking
- Storage bucket `submissions` — PDF uploads

**Verify the new column exists:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'assignments';
```

---

### 2. **Environment Variables** (One-time)

Get credentials from Supabase > Project Settings > API:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Save to `.env.local` (git-ignored, never commit).

---

### 3. **Build Test** (Local)

```bash
npm install
npm run build
```

✓ Should complete without errors
✓ Output directory: `dist/`

---

### 4. **Preview Locally** (Optional)

```bash
npm run preview
```

Test at `http://localhost:4173`:
- Login/Signup flow
- Teacher: Create assignment, grade submission
- Student: Submit assignment, view feedback

---

## 🚀 Deploy to Vercel

### Option A: Vercel CLI (Fastest)

```bash
npm install -g vercel
vercel
```

Follow prompts:
- Connect GitHub repo (recommended)
- Select deployment target
- Add environment variables when prompted

---

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Framework: **Vite**
4. Build command: `npm run build` (auto-detected)
5. Environment variables:
   ```
   VITE_SUPABASE_URL     = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
6. Deploy

---

## ✅ Post-Deployment Verification

1. **Test live URL**
   - Create account
   - Submit assignment (on-time & late)
   - Verify late penalty applies (0.5 points/day)
   - Grade submissions with "Suggest" button

2. **Check browser DevTools (F12)**
   - Network: No 400/500 errors
   - Console: No red errors (warnings OK)

3. **Verify database writes**
   - Supabase > Table Editor > `submissions`
   - Check `marks_awarded`, `deduction_pct` columns populated

---

## 🔧 Recent Changes (Deploy These)

### Database Schema
- ✅ Added `allow_late_submission` column to `assignments`
- ✅ `deduction_pct` now stores as INTEGER (50 = 0.5%)
- ✅ `marks_awarded` accepts decimal precision via UI rounding

### Code Features
- ✅ Late penalty: 0.5 points per day (auto-calculated)
- ✅ Student sees penalty before submitting
- ✅ Teachers see "Suggest" button for effective max marks
- ✅ Late submissions blockable per assignment
- ✅ Decimal precision in marks (0.5, 1.5, etc.)

### UI/UX
- ✅ Real-time effective max score display
- ✅ Current marks badge in grading view
- ✅ Penalty details in submission card
- ✅ Improved input placeholders and buttons

---

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Cannot find module" error
```bash
npm install
```

### 400 error on submission
- Check Supabase `allow_late_submission` column exists
- Verify environment variables in Vercel dashboard
- Check browser DevTools Network tab for request details

### Marks not saving
- Verify Vercel env vars match Supabase credentials
- Check RLS policies in Supabase (should allow teachers to update)
- Inspect browser console for API errors

---

## 📦 Deployment Checklist

- [ ] Supabase schema updated (includes `allow_late_submission`)
- [ ] `.env.local` configured with real credentials
- [ ] Local build passes (`npm run build`)
- [ ] Local preview tested (`npm run preview`)
- [ ] GitHub pushed (if using GitHub → Vercel auto-deploy)
- [ ] Vercel environment variables set
- [ ] Vercel build completes successfully
- [ ] Live URL tested (account creation, submission, grading)
- [ ] Database writes verified in Supabase

---

## 🌐 Your Live Project

Once deployed, share the Vercel URL with users:
- Teachers create assignments and grade submissions
- Students submit PDFs with automatic late penalties
- Marks tracked with penalty calculations

**Ready to go!** 🎓
