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

async function testTierras() {
  console.log('Testing Supabase query for productive_lands...');
  
  const { data, error } = await supabase
    .from('productive_lands')
    .select('*');

  if (error) {
    if (error.code === '42P01') {
      console.log('❌ TABLE NOT FOUND: La tabla "productive_lands" no existe aún en la base de datos.');
      console.log('POR FAVOR: Ejecuta el archivo "supabase/migrations/20240412_create_productive_lands.sql" en el editor SQL de Supabase.');
    } else {
      console.error('❌ QUERY ERROR:', JSON.stringify(error, null, 2));
    }
    return;
  }

  console.log('✅ QUERY SUCCESS');
  console.log('Number of properties found:', data?.length);
  if (data && data.length > 0) {
    console.log('Sample property:', data[0].name);
  } else {
    console.log('⚠️ LA TABLA ESTÁ VACÍA: Considera insertar los datos semilla del archivo SQL.');
  }
}

testTierras();
