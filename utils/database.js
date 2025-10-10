const mysql = require("mysql2");
require("dotenv").config();

let pool;

async function connect() {
  let cString =
    "mysql://" +
    process.env.MYSQL_USER +
    ":" +
    process.env.MYSQL_PASSWORD +
    "@" +
    process.env.MYSQL_HOST +
    ":" +
    process.env.MYSQL_PORT +
    "/" +
    process.env.MYSQL_DATABASE;
  pool = mysql
    .createPool(
      cString //digital ocean sql server
      // {
      //   // obj - localhost sql
      //   host: process.env.MYSQL_HOST,
      //   user: process.env.MYSQL_USER,
      //   password: process.env.MYSQL_PASSWORD,
      //   database: process.env.MYSQL_DATABASE,
      // }
    )
    .promise();
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