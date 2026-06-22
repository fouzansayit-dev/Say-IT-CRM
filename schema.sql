-- ==========================================
-- SAY IT — Database Schema & Trigger setup
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Reference to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    name TEXT,
    avatar TEXT,
    department TEXT NOT NULL DEFAULT 'General',
    position TEXT NOT NULL DEFAULT 'Staff',
    employee_id TEXT NOT NULL,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 2. PROJECTS Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning',
    priority TEXT NOT NULL DEFAULT 'medium',
    budget NUMERIC NOT NULL DEFAULT 0,
    spent NUMERIC NOT NULL DEFAULT 0,
    deadline DATE,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    department TEXT,
    progress NUMERIC NOT NULL DEFAULT 0,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TASKS Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    estimated_hours NUMERIC NOT NULL DEFAULT 0,
    actual_hours NUMERIC NOT NULL DEFAULT 0,
    due_date DATE,
    labels TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PROBLEMS Table
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL DEFAULT 'medium',
    department TEXT,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'open',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    selected_solution_id UUID, -- circular ref handled by constraint later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SOLUTIONS Table
CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    pros TEXT[] DEFAULT '{}'::TEXT[],
    cons TEXT[] DEFAULT '{}'::TEXT[],
    estimated_cost NUMERIC NOT NULL DEFAULT 0,
    estimated_time TEXT,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add circular foreign key for selected_solution_id on problems
ALTER TABLE public.problems 
ADD CONSTRAINT fk_selected_solution 
FOREIGN KEY (selected_solution_id) 
REFERENCES public.solutions(id) 
ON DELETE SET NULL;

-- 6. CHANGE REQUESTS Table
CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    requested_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. IDEAS Table
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    expected_benefit TEXT,
    estimated_cost NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    trending_score NUMERIC NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ATTENDANCE Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TEXT,
    check_out TEXT,
    status TEXT NOT NULL DEFAULT 'present',
    working_hours NUMERIC NOT NULL DEFAULT 0,
    is_late BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (employee_id, date)
);

-- 9. LEAVE REQUESTS Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. CHAT ROOMS Table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'channel',
    name TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE
);

-- 11. CHAT ROOM MEMBERS Table
CREATE TABLE IF NOT EXISTS public.chat_room_members (
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, user_id)
);

-- 12. CHAT MESSAGES Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create Permissive Policies for Authenticated Users (Read/Write)
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update profiles" ON public.profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update projects" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete projects" ON public.projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read problems" ON public.problems FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert problems" ON public.problems FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update problems" ON public.problems FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete problems" ON public.problems FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read solutions" ON public.solutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert solutions" ON public.solutions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update solutions" ON public.solutions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete solutions" ON public.solutions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read change_requests" ON public.change_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert change_requests" ON public.change_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update change_requests" ON public.change_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete change_requests" ON public.change_requests FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read ideas" ON public.ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert ideas" ON public.ideas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update ideas" ON public.ideas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete ideas" ON public.ideas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read attendance" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update attendance" ON public.attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read leave_requests" ON public.leave_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert leave_requests" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update leave_requests" ON public.leave_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read chat_rooms" ON public.chat_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert chat_rooms" ON public.chat_rooms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read chat_room_members" ON public.chat_room_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert chat_room_members" ON public.chat_room_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read chat_messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert chat_messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (true);

-- ==========================================
-- AUTO-SYNC USER SIGNUPS (AUTH.USERS TO PROFILES)
-- ==========================================

-- Trigger function to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    department,
    position,
    employee_id,
    join_date,
    is_active
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'employee'),
    COALESCE(new.raw_user_meta_data->>'department', 'General'),
    COALESCE(new.raw_user_meta_data->>'position', 'Staff'),
    'EMP_' || UPPER(SUBSTRING(new.id::text FROM 1 FOR 6)),
    CURRENT_DATE,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
