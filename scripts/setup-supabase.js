const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  // Create the table using RPC (we need to use raw SQL via Supabase dashboard or direct connection)
  // Since we can't execute arbitrary SQL via the JS client, we'll use the table editor API
  
  // For now, let's just test the connection
  const { data, error } = await supabase.from('opdracht_inzendingen').select('count').limit(1);
  
  if (error) {
    console.log('Table does not exist yet. Creating...');
    console.log('Please run the SQL schema manually in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/sddepssclfnmelilxijh/sql');
    console.log('\nSchema file: supabase/schema.sql');
  } else {
    console.log('✅ Table exists and is accessible!');
  }
}

setupDatabase();
