/**
 * Simple Admin User Setup Script
 * 
 * Run this with: node setup-admin-user-simple.js
 * 
 * Make sure you have SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'kanyiji.dev@gmail.com';
const ADMIN_PASSWORD = '#amazingroot';

async function setupAdminUser() {
  try {
    console.log('🚀 Setting up admin user...\n');

    // Step 1: Check if user exists, create if not
    console.log('📋 Step 1: Checking/Creating user...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL);
    
    let userId;
    
    if (existingUser) {
      console.log('✅ User already exists');
      userId = existingUser.id;
    } else {
      console.log('➕ Creating new user...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' },
      });
      
      if (createError) throw createError;
      userId = newUser.user.id;
      console.log('✅ User created');
    }

    // Step 2: Update profile to admin (try update first, then insert)
    console.log('\n📋 Step 2: Setting admin role...');
    
    // Try to update existing profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single();
    
    if (updatedProfile && !updateError) {
      console.log('✅ Profile updated to admin');
    } else {
      // Try to insert new profile
      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: ADMIN_EMAIL,
          full_name: 'Admin User',
          role: 'admin',
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error:', insertError.message);
        throw insertError;
      }
      console.log('✅ Profile created with admin role');
    }

    // Verify
    console.log('\n📋 Step 3: Verifying...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (profile && profile.role === 'admin') {
      console.log('✅ Admin user setup complete!');
      console.log('\n🎉 Login credentials:');
      console.log('   Email:', ADMIN_EMAIL);
      console.log('   Password:', ADMIN_PASSWORD);
      console.log('   URL: /admin/login');
    } else {
      console.error('❌ Verification failed - role is:', profile?.role);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Alternative: Run this SQL in Supabase SQL Editor:');
    console.log(`
      UPDATE profiles 
      SET role = 'admin' 
      WHERE email = '${ADMIN_EMAIL}';
    `);
  }
}

setupAdminUser();

