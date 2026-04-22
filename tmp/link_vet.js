const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkUser() {
  try {
    // 1. Get the user_id from the latest appointment
    const { data: appts, error: err1 } = await supabase
      .from('appointments')
      .select('user_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (err1 || !appts || appts.length === 0) {
      console.log('No appointment found to extract User ID.');
      return;
    }

    const userId = appts[0].user_id;
    console.log('Linking User ID:', userId);

    // 2. Link this user to Dr. Ricardo Mendoza (first vet)
    const { data, error: err2 } = await supabase
      .from('veterinarian_profiles')
      .update({ user_id: userId })
      .eq('professional_title', 'Dr. Ricardo Mendoza')
      .select();

    if (err2) throw err2;
    console.log('Successfully linked Dr. Ricardo Mendoza to User ID:', userId);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

linkUser();
