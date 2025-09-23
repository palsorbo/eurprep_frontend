-- Create interview_sessions table
CREATE TABLE public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id), -- Supabase auth user ID (required)
    interview_type TEXT NOT NULL, -- 'sbi-po', etc.
    interview_set TEXT NOT NULL, -- 'Set1', 'Set2', 'Set3'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    session_data JSONB NOT NULL, -- All InterviewSession data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX idx_interview_sessions_created_at ON public.interview_sessions(created_at);

-- Add RLS policies
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions"
    ON public.interview_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.interview_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON public.interview_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Only service role can delete
CREATE POLICY "Service role can delete sessions"
    ON public.interview_sessions
    FOR DELETE
    USING (auth.role() = 'service_role');
