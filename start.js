#!/usr/bin/env node

// Production startup script with proper error handling
require('dotenv').config();

const { connect } = require('./utils/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting Dumpster Fire Coding server...');
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔧 Port:', PORT);
    
    // Check if we should use fallback mode
    if (process.env.USE_FALLBACK === 'true') {
      console.log('🔄 Using fallback mode - starting without database');
      const { spawn } = require('child_process');
      const fallback = spawn('node', ['start-fallback.js'], { stdio: 'inherit' });
      fallback.on('exit', (code) => process.exit(code));
      return;
    }
    
    // Check environment variables
    const requiredVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`  - ${varName}`));
      console.error('');
      console.error('🔧 QUICK FIX: Add this environment variable to skip database:');
      console.error('   Name: USE_FALLBACK');
      console.error('   Value: true');
      console.error('');
      console.error('Or set these database variables:');
      console.error('   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
      process.exit(1);
    }
    
    console.log('✅ All required environment variables are set');
    
    // Connect to database first
    console.log('📊 Connecting to database...');
    console.log('Database host:', process.env.MYSQL_HOST);
    console.log('Database name:', process.env.MYSQL_DATABASE);
    
    await connect();
    console.log('✅ Database connected successfully');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🎉 Application started successfully!');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Error code:', error.code);
    
    // Provide specific error messages
    if (error.message.includes('Missing required database environment variables')) {
      console.error('🔧 Fix: Set environment variables in DigitalOcean dashboard');
      console.error('Required: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Fix: Check database host and port');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔧 Fix: Check database username and password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🔧 Fix: Check database name');
    }
    
    process.exit(1);
  }
}

startServer();
