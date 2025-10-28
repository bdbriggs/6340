#!/usr/bin/env node

// Ultra-simple startup script that always works
console.log('🚀 Starting Dumpster Fire Coding server...');

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
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

// Gallery with hardcoded data
app.get('/gallery', (req, res) => {
  const photos = [
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
  
  res.render('gallery', { title: 'Gallery', photos });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🎉 Gallery should be working now!');
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully');
  process.exit(0);
});
