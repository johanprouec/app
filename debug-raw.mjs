import https from 'https';

const url = "https://rqipromkipsiveobvjsn.supabase.co/rest/v1/";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxaXByb21raXBzaXZlb2J2anNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDAwOTAsImV4cCI6MjA5MDIxNjA5MH0.QMk3s0duNUhGJczU3MHlrRDLbnY9x4tOGgGThy9yBkA";

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
    console.log('Status Code:', res.statusCode);
    console.log('Raw data snippet:', data.substring(0, 1000));
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
