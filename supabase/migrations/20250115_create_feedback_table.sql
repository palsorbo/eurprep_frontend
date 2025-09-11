-- Create feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL, -- Socket.IO session ID (not UUID)
    user_id TEXT NOT NULL, -- User ID from Supabase auth
    interview_set TEXT NOT NULL,
    version TEXT NOT NULL,
    feedback_data JSONB NOT NULL, -- Complete InterviewEvaluation object
    overall_feedback JSONB NOT NULL, -- OverallFeedback object
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_session_id ON feedback(session_id);
CREATE INDEX idx_feedback_interview_set ON feedback(interview_set);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Add RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
    ON feedback
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage feedback"
    ON feedback
    USING (auth.role() = 'service_role');
