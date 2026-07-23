const mysql = require('mysql2/promise');

const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
];

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1 AS connection_test');
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection
};
