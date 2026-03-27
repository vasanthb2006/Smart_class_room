# 🚀 Deploy to Vercel in 5 Minutes

**For users who have Supabase already set up.**

---

## Step 1: Update Supabase Schema (1 min)

1. Open [Supabase Dashboard](https://supabase.com) > Your Project
2. Go to **SQL Editor** > New Query
3. Copy entire contents of `supabase-schema.sql` from this repo
4. Paste into SQL editor and click **Run**
5. ✓ All tables created

---

## Step 2: Get Credentials (1 min)

1. Supabase > **Settings** > **API**
2. Copy under "Project URL":
   ```
   https://your-project-id.supabase.co
   ```
3. Copy under "anon public":
   ```
   eyJhbGciOiJIUzI1NiIs...
   ```

---

## Step 3: Build Locally (1 min)

```bash
npm install
npm run build
```

✓ Should complete without errors.

---

## Step 4: Deploy to Vercel (1 min)

### Option A: Vercel CLI (Fastest)
```bash
npm install -g vercel
vercel
```
Follow prompts to add environment variables.

### Option B: Vercel Dashboard
1. [vercel.com](https://vercel.com) > **Add New** > **Project**
2. Import from GitHub (or paste repo URL)
3. Environment Variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   ```
4. Click **Deploy**

---

## Step 5: Test Live Site (1 min)

1. Copy Vercel URL from dashboard
2. **Sign up** as teacher
3. **Create assignment**
4. **Submit** as student
5. **Grade** submission

✓ Done! 🎓

---

## Troubleshooting 2-Minute Fix

| Error | Fix |
|---|---|
| Build fails | `npm install` then `npm run build` |
| 400 errors | Verify Vercel env vars match Supabase |
| Can't submit | Check Supabase RLS policies (run schema) |
| No marks saving | Restart browser DevTools cache (Ctrl+Shift+R) |

---

**Need detailed help?** See `DEPLOYMENT.md` or `CHECKLIST.md`
