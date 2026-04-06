import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rqipromkipsiveobvjsn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaXByb21raXBzaXZlb2J2anNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDAwOTAsImV4cCI6MjA5MDIxNjA5MH0.QMk3s0duNUhGJczU3MHlrRDLbnY9x4tOGgGThy9yBkA";

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
