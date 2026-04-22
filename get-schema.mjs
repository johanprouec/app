import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const url = `${supabaseUrl}/rest/v1/`;

async function getSpec() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const spec = await res.json();
  console.log('Tables exposed:');
  console.log(Object.keys(spec.definitions || spec.components?.schemas || {}));
}

getSpec();
