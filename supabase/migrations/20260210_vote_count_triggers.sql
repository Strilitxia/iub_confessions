-- =============================================
-- Automatic Vote Count Management
-- =============================================
-- This migration creates triggers to automatically update
-- the upvote_count column in confessions table whenever
-- a vote is added or removed from the votes table.
--
-- Benefits:
-- - Eliminates manual UPDATE queries in application code
-- - Ensures vote counts are always accurate
-- - Prevents race conditions
-- - Atomic operations (vote insert/delete + count update)
--
-- Usage:
-- Run this migration in Supabase SQL Editor or via CLI:
--   supabase migration up
-- =============================================

-- Function: Increment upvote_count when vote is added
CREATE OR REPLACE FUNCTION increment_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE confessions
    SET upvote_count = upvote_count + 1
    WHERE id = NEW.confession_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Decrement upvote_count when vote is removed
CREATE OR REPLACE FUNCTION decrement_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE confessions
    SET upvote_count = upvote_count - 1
    WHERE id = OLD.confession_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After INSERT on votes table
CREATE TRIGGER after_vote_insert
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION increment_upvote_count();

-- Trigger: After DELETE on votes table
CREATE TRIGGER after_vote_delete
AFTER DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION decrement_upvote_count();

-- =============================================
-- Verification Queries (optional)
-- =============================================
-- After running this migration, verify with:
--
-- 1. Check triggers are installed:
--    SELECT * FROM information_schema.triggers
--    WHERE trigger_name IN ('after_vote_insert', 'after_vote_delete');
--
-- 2. Test vote insertion (replace IDs with real values):
--    INSERT INTO votes (user_id, confession_id) VALUES ('<user_id>', '<confession_id>');
--    SELECT upvote_count FROM confessions WHERE id = '<confession_id>';
--
-- 3. Test vote deletion:
--    DELETE FROM votes WHERE user_id = '<user_id>' AND confession_id = '<confession_id>';
--    SELECT upvote_count FROM confessions WHERE id = '<confession_id>';
-- =============================================
