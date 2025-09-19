-- Create interview_sessions table
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Supabase auth user ID (required)
    interview_type TEXT NOT NULL, -- 'sbi-po', etc.
    interview_set TEXT NOT NULL, -- 'Set1', 'Set2', 'Set3'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    session_data JSONB NOT NULL, -- All InterviewSession data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX idx_interview_sessions_created_at ON interview_sessions(created_at);

-- Add RLS policies
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions"
    ON interview_sessions
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON interview_sessions
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Only service role can insert/delete
CREATE POLICY "Service role can manage sessions"
    ON interview_sessions
    FOR ALL
    USING (auth.role() = 'service_role');
