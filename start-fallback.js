#!/usr/bin/env node

// Fallback startup script for when database is not available
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple routes without database
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

app.get('/featured', (req, res) => {
  res.render('featured', { title: 'Featured' });
});

// Gallery with fallback data
app.get('/gallery', (req, res) => {
  const fallbackPhotos = [
    {
      id: 1,
      title: 'Sakura',
      image_url: '/images/sakura.png',
      caption: 'A delicate cherry blossom design capturing the ephemeral beauty of spring.',
      created_at: '2025-10-10'
    },
    {
      id: 2,
      title: 'Red Rectangles',
      image_url: '/images/RedRectangles.png',
      caption: 'A vibrant collection of red rectangular shapes creating a bold geometric composition.',
      created_at: '2025-10-10'
    },
    {
      id: 3,
      title: 'Pop Art Dumpster Fire',
      image_url: '/images/PopArtDumpsterFire.png',
      caption: 'A pop art style interpretation of the classic dumpster fire theme with vibrant colors.',
      created_at: '2023-12-15'
    }
  ];
  
  res.render('gallery', { title: 'Gallery', photos: fallbackPhotos });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'fallback',
    message: 'Running without database connection',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Fallback server running at http://localhost:${PORT}`);
  console.log('⚠️  Running without database - using fallback data');
  console.log('🔧 To enable full functionality, set database environment variables');
});
