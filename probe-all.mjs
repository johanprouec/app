import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rqipromkipsiveobvjsn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaXByb21raXBzaXZlb2J2anNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDAwOTAsImV4cCI6MjA5MDIxNjA5MH0.QMk3s0duNUhGJczU3MHlrRDLbnY9x4tOGgGThy9yBkA";

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
