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
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
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