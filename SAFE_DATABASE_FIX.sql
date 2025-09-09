-- Safe Database Fix for Foreign Key Constraint Issue
-- This script fixes the foreign key constraint without dropping data

-- 1. First, let's see what the current constraint looks like
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='profiles';

-- 2. Drop the problematic foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Recreate the foreign key constraint correctly
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Verify the constraint was created correctly
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='profiles';

-- 5. Test the constraint by trying to insert a test profile
-- (This will fail if the constraint is still wrong)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a real user ID from auth.users
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a test profile
        INSERT INTO profiles (id, email, full_name, role, email_verified)
        VALUES (test_user_id, 'test@example.com', 'Test User', 'customer', false)
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Foreign key constraint test passed - profile insert succeeded';
        
        -- Clean up the test profile
        DELETE FROM profiles WHERE id = test_user_id AND email = 'test@example.com';
    ELSE
        RAISE NOTICE 'No users found in auth.users to test with';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Foreign key constraint test failed: %', SQLERRM;
END $$;
