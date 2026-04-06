const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findUser() {
  // We can't easily get the session from CLI without a token, 
  // but we can check the recently created users in auth.users if we have service_role?
  // No, we'll try another way. I'll just check if there's any user in the 'appointments' table
  // because we just created one.
  
  const { data, error } = await supabase
    .from('appointments')
    .select('user_id')
    .limit(1);
    
  if (data && data.length > 0) {
    console.log('USER_ID_FOUND:' + data[0].user_id);
  } else {
    console.log('USER_ID_NOT_FOUND');
  }
}

findUser();
