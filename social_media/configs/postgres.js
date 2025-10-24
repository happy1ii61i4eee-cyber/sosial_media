const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL (Docker Compose)'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

module.exports = pool;