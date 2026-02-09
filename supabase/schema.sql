-- IUB Valentine Confession Website V2 - Database Schema
-- Run this in Supabase SQL Editor

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confessions table
CREATE TABLE public.confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  content JSONB NOT NULL,           -- Tiptap JSON content
  image_url TEXT,
  color_variant INTEGER DEFAULT 0,   -- 0-4 for card colors
  status TEXT DEFAULT 'pending',     -- pending, approved, hidden, removed
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Votes table
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, confession_id)
);

-- Reports table
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, resolved, dismissed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_confessions_status ON public.confessions(status);
CREATE INDEX idx_confessions_created ON public.confessions(created_at DESC);
CREATE INDEX idx_confessions_upvotes ON public.confessions(upvote_count DESC);
CREATE INDEX idx_votes_confession ON public.votes(confession_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Confessions Policies
CREATE POLICY "Approved confessions are viewable by everyone"
  ON public.confessions FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create confessions"
  ON public.confessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending confessions"
  ON public.confessions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can do everything on confessions"
  ON public.confessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Votes Policies
CREATE POLICY "Users can view all votes"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to increment upvote count
CREATE OR REPLACE FUNCTION increment_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.confessions
  SET upvote_count = upvote_count + 1
  WHERE id = NEW.confession_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement upvote count
CREATE OR REPLACE FUNCTION decrement_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.confessions
  SET upvote_count = GREATEST(upvote_count - 1, 0)
  WHERE id = OLD.confession_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for vote count
CREATE TRIGGER on_vote_inserted
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION increment_upvote_count();

CREATE TRIGGER on_vote_deleted
  AFTER DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION decrement_upvote_count();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
