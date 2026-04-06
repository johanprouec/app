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

async function testQuery() {
  console.log('Testing Supabase query for vets...');
  
  const { data, error } = await supabase
    .from('vets')
    .select(`
      *,
      vet_specialties(specialties(name)),
      vet_services(services(*), price)
    `);

  if (error) {
    console.error('❌ QUERY ERROR:', JSON.stringify(error, null, 2));
    return;
  }

  console.log('✅ QUERY SUCCESS');
  console.log('Number of vets found:', data?.length);
  if (data && data.length > 0) {
    console.log('Sample vet:', JSON.stringify(data[0], null, 2));
  }
}

testQuery();
