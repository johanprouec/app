import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rqipromkipsiveobvjsn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaXByb21raXBzaXZlb2J2anNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDAwOTAsImV4cCI6MjA5MDIxNjA5MH0.QMk3s0duNUhGJczU3MHlrRDLbnY9x4tOGgGThy9yBkA";

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
