import https from 'https';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const url = `${supabaseUrl}/rest/v1/`;

const options = {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const spec = JSON.parse(data);
      console.log('Tables exposed:', Object.keys(spec.definitions || {}));
    } catch (e) {
      console.error('Failed to parse:', e.message);
      console.log('Raw data snippet:', data.substring(0, 100));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
