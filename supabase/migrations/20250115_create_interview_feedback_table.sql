-- Create interview_feedback table
CREATE TABLE public.interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    interview_type TEXT NOT NULL,
    interview_set TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    feedback_data JSONB NOT NULL,
    overall_feedback JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_interview_feedback_session_id ON public.interview_feedback(interview_session_id);
CREATE INDEX idx_interview_feedback_user_id ON public.interview_feedback(user_id);
CREATE INDEX idx_interview_feedback_interview_type ON public.interview_feedback(interview_type);
CREATE INDEX idx_interview_feedback_created_at ON public.interview_feedback(created_at);

-- Add RLS policies
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
    ON public.interview_feedback
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage feedback"
    ON public.interview_feedback
    FOR ALL
    USING (auth.role() = 'service_role');
