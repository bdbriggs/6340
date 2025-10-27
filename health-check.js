// Health check endpoint for production monitoring
const express = require('express');
const { pool } = require('./utils/database');

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  try {
    // Check database connection
    if (pool) {
      await pool.query('SELECT 1');
      health.checks.database = 'ok';
    } else {
      health.checks.database = 'error: pool not initialized';
      health.status = 'error';
    }
  } catch (err) {
    health.checks.database = `error: ${err.message}`;
    health.status = 'error';
  }

  // Check environment variables
  const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    health.checks.environment = `error: missing variables: ${missingVars.join(', ')}`;
    health.status = 'error';
  } else {
    health.checks.environment = 'ok';
  }

  const statusCode = health.status === 'ok' ? 200 : 500;
  res.status(statusCode).json(health);
});

module.exports = router;
