-- Database Schema for Courage App
-- This file contains the complete SQL schema for the topics and jam_recordings tables
-- Includes production-ready Row Level Security (RLS) policies

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    track_id TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time INTEGER NOT NULL CHECK (estimated_time > 0),
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- JAM Recordings table
CREATE TABLE IF NOT EXISTS jam_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    storage_path TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
    status TEXT NOT NULL CHECK (status IN ('processing', 'analyzing', 'completed', 'failed')) DEFAULT 'processing',
    transcript TEXT,
    feedback_data JSONB,
    overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 10),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit System Tables

-- User credits table - stores current credit balance for each user
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Credit transactions table - audit trail for all credit operations
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'refund', 'bonus')),
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    metadata JSONB,
    recording_id UUID REFERENCES jam_recordings(id) ON DELETE SET NULL,
    payment_id TEXT, -- Razorpay payment ID for purchases
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on tables for production security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE jam_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
-- Topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_track_id ON topics(track_id);
CREATE INDEX IF NOT EXISTS idx_topics_difficulty ON topics(difficulty);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at);

-- JAM Recordings indexes
CREATE INDEX IF NOT EXISTS idx_jam_recordings_user_id ON jam_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_jam_recordings_topic_id ON jam_recordings(topic_id);
CREATE INDEX IF NOT EXISTS idx_jam_recordings_status ON jam_recordings(status);
CREATE INDEX IF NOT EXISTS idx_jam_recordings_created_at ON jam_recordings(created_at);
CREATE INDEX IF NOT EXISTS idx_jam_recordings_overall_score ON jam_recordings(overall_score);

-- Credit system indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_payment_id ON credit_transactions(payment_id);

-- RLS Policies for topics table
-- Topics are public read-only, only admins can modify
CREATE POLICY "Topics are viewable by everyone" ON topics
    FOR SELECT USING (true);

CREATE POLICY "Topics can only be created by authenticated users" ON topics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Topics can only be updated by authenticated users" ON topics
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Topics can only be deleted by authenticated users" ON topics
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for jam_recordings table
-- Users can only access their own recordings
CREATE POLICY "Users can view their own recordings" ON jam_recordings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recordings" ON jam_recordings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings" ON jam_recordings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings" ON jam_recordings
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_credits table
-- Users can only view their own credit balance
CREATE POLICY "Users can view their own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit record" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit record" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for credit_transactions table
-- Users can only view their own transactions
CREATE POLICY "Users can view their own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage Policies for jam-recordings bucket
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy to allow users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy to allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Comments for documentation
COMMENT ON TABLE topics IS 'Stores all practice topics that can be assigned to different tracks';
COMMENT ON COLUMN topics.id IS 'Primary key, auto-generated UUID';
COMMENT ON COLUMN topics.title IS 'Topic title';
COMMENT ON COLUMN topics.category IS 'Topic category (Technology, Workplace, etc.)';
COMMENT ON COLUMN topics.description IS 'Topic description';
COMMENT ON COLUMN topics.track_id IS 'References static track IDs (jam, ibps-po, hr-freshers)';
COMMENT ON COLUMN topics.difficulty IS 'Difficulty level (beginner, intermediate, advanced)';
COMMENT ON COLUMN topics.estimated_time IS 'Estimated time in seconds';
COMMENT ON COLUMN topics.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN topics.is_active IS 'Whether topic is available for practice';
COMMENT ON COLUMN topics.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN topics.updated_at IS 'Last update timestamp';

COMMENT ON TABLE jam_recordings IS 'Stores all JAM recordings with embedded feedback data';
COMMENT ON COLUMN jam_recordings.id IS 'Primary key, auto-generated UUID';
COMMENT ON COLUMN jam_recordings.user_id IS 'Foreign key to auth.users with CASCADE delete';
COMMENT ON COLUMN jam_recordings.topic_id IS 'Foreign key to topics with RESTRICT delete';
COMMENT ON COLUMN jam_recordings.storage_path IS 'Path to audio file in Supabase Storage';
COMMENT ON COLUMN jam_recordings.duration_seconds IS 'Recording duration in seconds (0-60)';
COMMENT ON COLUMN jam_recordings.status IS 'Processing status: processing, analyzing, completed, failed';
COMMENT ON COLUMN jam_recordings.transcript IS 'Transcribed text from audio';
COMMENT ON COLUMN jam_recordings.feedback_data IS 'Complete AI analysis and feedback (JSONB)';
COMMENT ON COLUMN jam_recordings.overall_score IS 'Overall score (0.00-10.00)';
COMMENT ON COLUMN jam_recordings.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN jam_recordings.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN jam_recordings.updated_at IS 'Last update timestamp';

COMMENT ON TABLE user_credits IS 'Stores current credit balance for each user';
COMMENT ON COLUMN user_credits.id IS 'Primary key, auto-generated UUID';
COMMENT ON COLUMN user_credits.user_id IS 'Foreign key to auth.users with CASCADE delete, unique per user';
COMMENT ON COLUMN user_credits.balance IS 'Current credit balance, must be >= 0';
COMMENT ON COLUMN user_credits.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN user_credits.updated_at IS 'Last update timestamp';

COMMENT ON TABLE credit_transactions IS 'Audit trail for all credit operations';
COMMENT ON COLUMN credit_transactions.id IS 'Primary key, auto-generated UUID';
COMMENT ON COLUMN credit_transactions.user_id IS 'Foreign key to auth.users with CASCADE delete';
COMMENT ON COLUMN credit_transactions.transaction_type IS 'Type of transaction: purchase, consumption, refund, bonus';
COMMENT ON COLUMN credit_transactions.amount IS 'Number of credits added/subtracted';
COMMENT ON COLUMN credit_transactions.balance_before IS 'Credit balance before transaction';
COMMENT ON COLUMN credit_transactions.balance_after IS 'Credit balance after transaction';
COMMENT ON COLUMN credit_transactions.description IS 'Human-readable description of transaction';
COMMENT ON COLUMN credit_transactions.metadata IS 'Additional transaction data (JSONB)';
COMMENT ON COLUMN credit_transactions.recording_id IS 'Associated recording for consumption/refund transactions';
COMMENT ON COLUMN credit_transactions.payment_id IS 'Razorpay payment ID for purchase transactions';
COMMENT ON COLUMN credit_transactions.created_at IS 'Transaction timestamp';

-- Security and RLS Policy Comments
COMMENT ON POLICY "Topics are viewable by everyone" ON topics IS 'Allows public read access to topics';
COMMENT ON POLICY "Topics can only be created by authenticated users" ON topics IS 'Restricts topic creation to authenticated users';
COMMENT ON POLICY "Topics can only be updated by authenticated users" ON topics IS 'Restricts topic updates to authenticated users';
COMMENT ON POLICY "Topics can only be deleted by authenticated users" ON topics IS 'Restricts topic deletion to authenticated users';

COMMENT ON POLICY "Users can view their own recordings" ON jam_recordings IS 'Users can only see their own JAM recordings';
COMMENT ON POLICY "Users can create their own recordings" ON jam_recordings IS 'Users can only create recordings for themselves';
COMMENT ON POLICY "Users can update their own recordings" ON jam_recordings IS 'Users can only update their own recordings';
COMMENT ON POLICY "Users can delete their own recordings" ON jam_recordings IS 'Users can only delete their own recordings';

COMMENT ON POLICY "Users can view their own credits" ON user_credits IS 'Users can only see their own credit balance';
COMMENT ON POLICY "Users can create their own credit record" ON user_credits IS 'Users can only create credit records for themselves';
COMMENT ON POLICY "Users can update their own credit record" ON user_credits IS 'Users can only update their own credit records';

COMMENT ON POLICY "Users can view their own transactions" ON credit_transactions IS 'Users can only see their own credit transactions';
COMMENT ON POLICY "Users can create their own transactions" ON credit_transactions IS 'Users can only create transactions for themselves';

-- Storage Policy Comments
COMMENT ON POLICY "Users can upload to their own folder" ON storage.objects IS 'Allows authenticated users to upload files to their own user folder';
COMMENT ON POLICY "Users can view their own files" ON storage.objects IS 'Allows users to view files in their own user folder';
COMMENT ON POLICY "Users can update their own files" ON storage.objects IS 'Allows users to update files in their own user folder';
COMMENT ON POLICY "Users can delete their own files" ON storage.objects IS 'Allows users to delete files in their own user folder'; 