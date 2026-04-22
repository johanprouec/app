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

async function listTables() {
  console.log('Listing available tables from public schema via RPC or introspection...');
  
  // Since we can't run raw SQL easily via anon key, we'll try to fetch some common tables
  const commonTables = ['vets', 'veterinarios', 'specialties', 'especialidades', 'services', 'servicios', 'vet_reviews', 'profiles'];
  
  for (const table of commonTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': FOUND (${data.length} rows)`);
    }
  }
}

listTables();
