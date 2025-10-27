const mysql = require("mysql2");
require("dotenv").config();

let pool;

async function connect() {
  // Support both MYSQL_* and DB_* environment variable formats
  const dbUser = process.env.MYSQL_USER || process.env.DB_USER;
  const dbPassword = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
  const dbHost = process.env.MYSQL_HOST || process.env.DB_HOST;
  const dbPort = process.env.MYSQL_PORT || process.env.DB_PORT || '3306';
  const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME;
  
  // Validate required environment variables
  if (!dbUser || !dbPassword || !dbHost || !dbName) {
    const missing = [];
    if (!dbUser) missing.push('DB_USER/MYSQL_USER');
    if (!dbPassword) missing.push('DB_PASSWORD/MYSQL_PASSWORD');
    if (!dbHost) missing.push('DB_HOST/MYSQL_HOST');
    if (!dbName) missing.push('DB_NAME/MYSQL_DATABASE');
    
    throw new Error(`Missing required database environment variables: ${missing.join(', ')}`);
  }
  
  let cString =
    "mysql://" +
    dbUser +
    ":" +
    dbPassword +
    "@" +
    dbHost +
    ":" +
    dbPort +
    "/" +
    dbName;
  pool = mysql
    .createPool({
      connectionLimit: 10,
      uri: cString
    })
    .promise();
    
  // Test the connection
  try {
    await pool.query('SELECT 1');
    console.log('[db] connected successfully');
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    throw err;
  }
}

async function getAllProjects() {
  const [rows] = await pool.query(`SELECT * FROM projects;`);
  return rows;
}

// Export the pool and functions for use in other files
module.exports = {
  connect,
  getAllProjects,
  get pool() { return pool; }
};