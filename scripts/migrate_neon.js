const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local if present
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.replace(/^['"](.*)['"]$/, '$1').trim();
      process.env[key] = value;
    }
  });
}

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://'))) {
    console.error('ERROR: Valid DATABASE_URL is not set in .env.local.');
    console.error('Expected format: postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL database...');
  const pool = new Pool({ connectionString });
  const sql = fs.readFileSync(path.join(__dirname, 'init_neon_db.sql'), 'utf8');

  try {
    await pool.query(sql);
    console.log('SUCCESS! All tables and indexes created in Neon DB successfully:');
    console.log(' - user');
    console.log(' - session');
    console.log(' - account');
    console.log(' - verification');
    console.log(' - user_library');
    console.log(' - user_settings');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
