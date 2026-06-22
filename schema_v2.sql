-- ==========================================
-- SAY IT — Schema v2 Additions (Enterprise Features)
-- ==========================================

-- 1. Extend PROFILES Table
-- We already have `is_active` in profiles, so no additional columns are strictly required for activation/deactivation.

-- 2. Extend PROJECTS Table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS dependencies UUID[] DEFAULT '{}'::UUID[];

-- 3. M:N ASSIGNMENTS Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (project_id, employee_id, client_id)
);

-- 4. PROJECT MILESTONES Table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PROJECT DOCUMENTS & INVOICES Table
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    size NUMERIC,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_invoice BOOLEAN NOT NULL DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PROJECT COMMENTS Table
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. AUDIT LOGS Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CLIENT REQUESTS Table
CREATE TABLE IF NOT EXISTS public.client_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    deadline DATE,
    budget NUMERIC,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. HR FEEDBACK Table
CREATE TABLE IF NOT EXISTS public.hr_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    hr_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'general',
    feedback TEXT NOT NULL,
    response TEXT,
    status TEXT NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_feedback ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users
CREATE POLICY "Allow authenticated read assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update assignments" ON public.assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete assignments" ON public.assignments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read project_milestones" ON public.project_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert project_milestones" ON public.project_milestones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update project_milestones" ON public.project_milestones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete project_milestones" ON public.project_milestones FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read project_documents" ON public.project_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert project_documents" ON public.project_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update project_documents" ON public.project_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete project_documents" ON public.project_documents FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read project_comments" ON public.project_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert project_comments" ON public.project_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update project_comments" ON public.project_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete project_comments" ON public.project_comments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read client_requests" ON public.client_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert client_requests" ON public.client_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update client_requests" ON public.client_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete client_requests" ON public.client_requests FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read hr_feedback" ON public.hr_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert hr_feedback" ON public.hr_feedback FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update hr_feedback" ON public.hr_feedback FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete hr_feedback" ON public.hr_feedback FOR DELETE TO authenticated USING (true);
