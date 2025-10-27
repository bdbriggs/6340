// routes/gallery.js
const express = require('express');
const { pool } = require('../utils/database');

const router = express.Router();

router.get('/gallery', async (req, res, next) => {
  console.log('[gallery] Request received at:', new Date().toISOString());
  console.log('[gallery] Request headers:', req.headers);
  
  try {
    // Check if pool is available
    if (!pool) {
      console.error('[gallery] Database pool not initialized');
      return res.status(500).render('error', { 
        title: 'Database Error', 
        message: 'Database connection not available. Please try again later.' 
      });
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
    console.error('[gallery] Error occurred:', err);
    console.error('[gallery] Error stack:', err.stack);
    console.error('[gallery] Error code:', err.code);
    
    // Provide more specific error handling
    if (err.code === 'ECONNREFUSED') {
      console.error('[gallery] Database connection refused');
      return res.status(500).render('error', { 
        title: 'Database Connection Error', 
        message: 'Unable to connect to database. Please check your database configuration.' 
      });
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('[gallery] Database authentication failed');
      return res.status(500).render('error', { 
        title: 'Database Authentication Error', 
        message: 'Database authentication failed. Please check your credentials.' 
      });
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('[gallery] Database not found');
      return res.status(500).render('error', { 
        title: 'Database Error', 
        message: 'Database not found. Please check your database name.' 
      });
    }
    
    console.error('[gallery] Unhandled error, passing to next middleware');
    next(err);
  }
});

module.exports = router;
