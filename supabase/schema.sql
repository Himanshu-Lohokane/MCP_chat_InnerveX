-- Complete Supabase Schema for Team Diplomats AI Productivity Assistant
-- This schema supports the existing chat + new n8n-based task extraction

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- PROFILES TABLE (User management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MESSAGES TABLE (Chat messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    is_task_created BOOLEAN DEFAULT FALSE,  -- Flag to prevent duplicate processing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_is_task_created_idx ON public.messages(is_task_created) WHERE is_task_created = FALSE;

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================================
-- TASKS TABLE (AI-extracted tasks with confidence scoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    confidence DECIMAL(5, 4) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    reasoning TEXT,  -- AI explanation for transparency
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    calendar_event_id TEXT  -- Google Calendar event ID
);

-- Indexes
CREATE INDEX IF NOT EXISTS tasks_receiver_id_idx ON public.tasks(receiver_id);
CREATE INDEX IF NOT EXISTS tasks_sender_id_idx ON public.tasks(sender_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at DESC);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- GOOGLE TOKENS TABLE (OAuth tokens for calendar integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_google_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    scope TEXT NOT NULL,
    expiry_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_google_tokens_user_id_idx ON public.user_google_tokens(user_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE 
  USING (auth.uid() = sender_id);

-- Tasks policies
CREATE POLICY "Users can view their tasks" ON public.tasks FOR SELECT 
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
CREATE POLICY "Users can insert tasks" ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their tasks" ON public.tasks FOR UPDATE 
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Tokens policies
CREATE POLICY "Users can view own tokens" ON public.user_google_tokens FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tokens" ON public.user_google_tokens FOR ALL 
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.messages
        WHERE receiver_id = user_uuid AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.messages IS 'Chat messages with task extraction flags';
COMMENT ON TABLE public.tasks IS 'AI-extracted tasks with confidence scoring and reasoning';
COMMENT ON COLUMN public.tasks.confidence IS 'AI confidence score (0-1) for task extraction';
COMMENT ON COLUMN public.tasks.reasoning IS 'AI explanation for why task was extracted (transparency)';
COMMENT ON COLUMN public.messages.is_task_created IS 'Flag to prevent duplicate n8n processing';
