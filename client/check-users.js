require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name');
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('\n📋 Current Users in System:\n');
  if (data.length === 0) {
    console.log('   No users found');
  } else {
    data.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.username || 'N/A'} (${user.full_name || 'N/A'})`);
    });
  }
  console.log(`\n   Total: ${data.length} user(s)\n`);
  
  if (data.length === 1) {
    console.log('⚠️  You need at least 2 users to test chat!');
    console.log('   Open incognito window and sign up with another email.\n');
  }
}

checkUsers();
