-- Disable email confirmation requirement in Supabase
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ypzpwjfddhnmuihnjhuo/sql/new

-- This tells Supabase to auto-confirm all new signups
UPDATE auth.config 
SET confirm_email_enabled = false;

-- If that doesn't work, you can manually confirm existing users:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
