// routes/gallery.js
const express = require('express');
const { pool } = require('../utils/database');

const router = express.Router();

// Fallback data when database is not available
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

router.get('/gallery', async (req, res, next) => {
  console.log('[gallery] Request received at:', new Date().toISOString());
  
  try {
    // Check if database is properly configured
    if (!pool || !process.env.MYSQL_HOST || process.env.MYSQL_HOST === 'undefined') {
      console.log('[gallery] Using fallback data - database not configured');
      return res.render('gallery', { title: 'Gallery', photos: fallbackPhotos });
    }

    console.log('[gallery] Database pool available, querying...');
    
    // Pull active rows from the projects table
    const [rows] = await pool.query('SELECT * FROM `projects` WHERE active = 1 ORDER BY id DESC LIMIT 48');
    console.log('[gallery] Database query successful, rows:', rows.length);

    // Map database column names to the names your EJS template uses
    const photos = rows.map(r => ({
      id: r.id ?? r.project_id ?? r.pid ?? null,
      title: r.project_name ?? r.title ?? r.name ?? r.project_title ?? 'Untitled',
      image_url: r.img_url ?? r.image_url ?? r.image ?? r.image_path ?? r.thumbnail ?? r.img ?? '',
      caption: r.project_description ?? r.caption ?? r.description ?? r.summary ?? '',
      created_at: r.open_date_gmt ?? r.created_at ?? r.created ?? r.date ?? r.timestamp ?? null,
    }));

    console.log('[gallery] Mapped photos:', photos.length);
    console.log('[gallery] Photo titles:', photos.map(p => p.title));
    
    console.log('[gallery] Rendering gallery template...');
    res.render('gallery', { title: 'Gallery', photos });
    console.log('[gallery] Gallery rendered successfully');
    
  } catch (err) {
    console.error('[gallery] Database error, using fallback data:', err.message);
    
    // Use fallback data instead of showing error
    res.render('gallery', { title: 'Gallery', photos: fallbackPhotos });
  }
});

module.exports = router;