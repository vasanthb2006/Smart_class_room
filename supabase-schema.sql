-- ============================================================
-- SMART CLASSROOM — SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Clean up existing tables and policies to ensure a fresh schema
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ── 1. users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  email    TEXT NOT NULL UNIQUE,
  role     TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  avatar   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure users can read profiles (needed for teachers to see student names)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.users;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 

-- Anyone authenticated can read users
CREATE POLICY "Users are viewable by authenticated users"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own record
CREATE POLICY "Users can insert their own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update their own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ── 2. assignments ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  due_date    TIMESTAMPTZ NOT NULL,
  max_marks   INTEGER NOT NULL DEFAULT 100,
  allow_late_submission BOOLEAN DEFAULT TRUE,
  created_by  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url    TEXT,
  file_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assignments
CREATE POLICY "Assignments viewable by authenticated users"
  ON public.assignments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only teachers can create assignments
CREATE POLICY "Teachers can create assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
  );

-- Teachers can update their own assignments
CREATE POLICY "Teachers can update own assignments"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = created_by);

-- Teachers can delete their own assignments
CREATE POLICY "Teachers can delete own assignments"
  ON public.assignments FOR DELETE
  USING (auth.uid() = created_by);

-- ── 3. submissions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL,
  file_name     TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  marks_awarded INTEGER,
  is_late       BOOLEAN DEFAULT FALSE,
  late_days     INTEGER DEFAULT 0,
  deduction_pct INTEGER DEFAULT 0,
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions; teachers can view all
CREATE POLICY "Students view own submissions, teachers view all"
  ON public.submissions FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
  );

-- Students can insert their own submissions
CREATE POLICY "Students can submit"
  ON public.submissions FOR INSERT
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
  );

-- Students can update their own submissions (re-upload)
CREATE POLICY "Students can update own submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can update submissions (to award marks)
CREATE POLICY "Teachers can grade submissions"
  ON public.submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
  );

-- ── 4. Storage Bucket ─────────────────────────────────────
-- Run in Supabase Dashboard > Storage > New Bucket
-- Name: submissions
-- Public: false
-- Allowed MIME types: application/pdf

-- Storage policies (run in SQL editor):
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('submissions', 'submissions', false, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can upload PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view their own submissions" ON storage.objects;
CREATE POLICY "Users can view their own submissions"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- New Storage Bucket: assignments (for teacher PDFs)
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('assignments', 'assignments', true, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Teachers can upload assignment PDFs" ON storage.objects;
CREATE POLICY "Teachers can upload assignment PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignments' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
  );

DROP POLICY IF EXISTS "Everyone can view assignment PDFs" ON storage.objects;
CREATE POLICY "Everyone can view assignment PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignments');

DROP POLICY IF EXISTS "Teachers can delete their own assignment PDFs" ON storage.objects;
CREATE POLICY "Teachers can delete their own assignment PDFs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assignments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 5. Trigger: Auto-create user profile on signup ────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
