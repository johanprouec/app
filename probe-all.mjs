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

async function probe() {
  const tables = ['vets', 'specialties', 'services', 'vet_specialties', 'appointments', 'veterinarians', 'profesionales', 'especialistas'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('count');
    if (error) {
      console.log(`❌ Table '${t}': ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`✅ Table '${t}': FOUND`);
    }
  }
}

probe();
