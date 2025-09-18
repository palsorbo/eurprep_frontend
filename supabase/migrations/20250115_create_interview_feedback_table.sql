-- Create interview_feedback table
CREATE TABLE interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    interview_type TEXT NOT NULL,
    interview_set TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    feedback_data JSONB NOT NULL,
    overall_feedback JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_interview_feedback_session_id ON interview_feedback(interview_session_id);
CREATE INDEX idx_interview_feedback_user_id ON interview_feedback(user_id);
CREATE INDEX idx_interview_feedback_interview_type ON interview_feedback(interview_type);
CREATE INDEX idx_interview_feedback_created_at ON interview_feedback(created_at);

-- Add RLS policies
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
    ON interview_feedback
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage feedback"
    ON interview_feedback
    USING (auth.role() = 'service_role');
