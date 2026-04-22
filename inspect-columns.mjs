import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log('Inspecting vet_specialties table columns...');
  const { data, error } = await supabase.from('vet_specialties').select('*').limit(1);
  if (error) {
    console.error('Error fetching vet_specialties:', error.message);
  } else {
    console.log('vet_specialties columns:', Object.keys(data[0] || {}));
    if (data.length === 0) console.log('Table is empty.');
  }

  console.log('Inspecting appointments table columns...');
  const { data: appData, error: appError } = await supabase.from('appointments').select('*').limit(1);
  if (appError) {
    console.error('Error fetching appointments:', appError.message);
  } else {
    console.log('appointments columns:', Object.keys(appData[0] || {}));
  }
}

inspect();
