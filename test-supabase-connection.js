const { Client } = require('pg');

// Test both connection strings
const connections = [
  {
    name: 'Session Mode (Port 5432)',
    connectionString: 'postgres://postgres.hoopabvygbofvptnlyzj:Ernijs121291!@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
  },
  {
    name: 'Transaction Mode (Port 6543)', 
    connectionString: 'postgres://postgres.hoopabvygbofvptnlyzj:Ernijs121291!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
  }
];

async function testConnection(config) {
  console.log(`\nTesting ${config.name}...`);
  const client = new Client({
    connectionString: config.connectionString,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`✅ SUCCESS: Connected at ${res.rows[0].now}`);
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('Testing Supabase connections...');
  
  for (const conn of connections) {
    const success = await testConnection(conn);
    if (success) {
      console.log(`\n🎉 Use this connection string in Vercel:`);
      console.log(conn.connectionString);
      break;
    }
  }
}

main().catch(console.error);