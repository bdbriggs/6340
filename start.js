#!/usr/bin/env node

// Production startup script with proper error handling
require('dotenv').config();

const { connect } = require('./utils/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting Dumpster Fire Coding server...');
    
    // Connect to database first
    console.log('📊 Connecting to database...');
    await connect();
    console.log('✅ Database connected successfully');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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
    process.exit(1);
  }
}

startServer();
