import fetch from 'node-fetch';

const url = "https://rqipromkipsiveobvjsn.supabase.co/rest/v1/";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaXByb21raXBzaXZlb2J2anNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDAwOTAsImV4cCI6MjA5MDIxNjA5MH0.QMk3s0duNUhGJczU3MHlrRDLbnY9x4tOGgGThy9yBkA";

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
