/**
 * Setup Admin User Script
 * 
 * This script helps create/setup the admin user in Supabase
 * Run this with: node setup-admin-user.js
 * 
 * Make sure you have:
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nPlease ensure these are set in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'kanyiji.dev@gmail.com';
const ADMIN_PASSWORD = '#amazingroot';
const ADMIN_NAME = 'Admin User';

async function setupAdminUser() {
  try {
    console.log('🚀 Setting up admin user...\n');

    // Step 1: Check if user already exists
    console.log('📋 Step 1: Checking if user exists...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      throw listError;
    }

    const existingUser = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL);
    
    let userId;
    
    if (existingUser) {
      console.log('✅ User already exists in auth.users');
      userId = existingUser.id;
      
      // Update password if needed (optional - uncomment if needed)
      // console.log('🔄 Updating password...');
      // const { error: updateError } = await supabase.auth.admin.updateUserById(
      //   userId,
      //   { password: ADMIN_PASSWORD }
      // );
      // if (updateError) {
      //   console.warn('⚠️  Could not update password:', updateError.message);
      // } else {
      //   console.log('✅ Password updated');
      // }
    } else {
      console.log('➕ Creating new user in auth.users...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: ADMIN_NAME,
        },
      });

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        throw createError;
      }

      console.log('✅ User created successfully');
      userId = newUser.user.id;
    }

    // Step 2: Create or update profile with admin role using RPC or SQL
    console.log('\n📋 Step 2: Setting up admin profile...');
    
    // First, try simple upsert without optional columns
    let profile;
    let profileError;
    
    // Try with all columns first
    const profileData = {
      id: userId,
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      role: 'admin',
    };
    
    const { data: profile1, error: error1 } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
      })
      .select()
      .single();
    
    if (error1 && error1.message.includes('is_active')) {
      // Try without is_active column
      console.log('⚠️  is_active column not found, trying without it...');
      const { data: profile2, error: error2 } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: ADMIN_EMAIL,
          full_name: ADMIN_NAME,
          role: 'admin',
        }, {
          onConflict: 'id',
        })
        .select()
        .single();
      
      profile = profile2;
      profileError = error2;
    } else {
      profile = profile1;
      profileError = error1;
    }
    
    // If still error, try using SQL directly
    if (profileError) {
      console.log('⚠️  Upsert failed, trying SQL update...');
      const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO profiles (id, email, full_name, role)
          VALUES ('${userId}', '${ADMIN_EMAIL}', '${ADMIN_NAME}', 'admin')
          ON CONFLICT (id) DO UPDATE
          SET role = 'admin',
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              updated_at = now();
        `
      }).catch(async () => {
        // If RPC doesn't exist, try direct update
        const { data: updateResult, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
          .select()
          .single();
        
        if (updateError) {
          // Try insert
          const { data: insertResult, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: ADMIN_EMAIL,
              full_name: ADMIN_NAME,
              role: 'admin',
            })
            .select()
            .single();
          
          return { data: insertResult, error: insertError };
        }
        
        return { data: updateResult, error: updateError };
      });
      
      if (!sqlError && sqlResult) {
        profile = sqlResult;
        profileError = null;
      }
    }

    if (profileError) {
      console.error('❌ Error creating/updating profile:', profileError.message);
      throw profileError;
    }

    console.log('✅ Admin profile created/updated successfully');
    console.log('\n📊 Admin User Details:');
    console.log('   ID:', profile.id);
    console.log('   Email:', profile.email);
    console.log('   Name:', profile.full_name);
    console.log('   Role:', profile.role);
    console.log('   Active:', profile.is_active);
    console.log('   Verified:', profile.is_verified);

    // Step 3: Verify setup
    console.log('\n📋 Step 3: Verifying setup...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (verifyError || !verifyProfile) {
      console.error('❌ Verification failed:', verifyError?.message);
      throw verifyError;
    }

    if (verifyProfile.role === 'admin' && verifyProfile.is_active) {
      console.log('✅ Admin user setup completed successfully!');
      console.log('\n🎉 You can now log in at: /admin/login');
      console.log('   Email:', ADMIN_EMAIL);
      console.log('   Password:', ADMIN_PASSWORD);
    } else {
      console.error('❌ Setup verification failed:');
      console.error('   Role:', verifyProfile.role, '(expected: admin)');
      console.error('   Active:', verifyProfile.is_active, '(expected: true)');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n📝 Manual Setup Instructions:');
    console.error('   1. Go to Supabase Dashboard → Authentication → Users');
    console.error('   2. Click "Add User" → "Create new user"');
    console.error(`   3. Email: ${ADMIN_EMAIL}`);
    console.error(`   4. Password: ${ADMIN_PASSWORD}`);
    console.error('   5. Run the SQL in setup-admin-user.sql');
    process.exit(1);
  }
}

// Run the setup
setupAdminUser();

