// routes/gallery.js
const express = require('express');
const { pool } = require('../utils/database');

const router = express.Router();

router.get('/gallery', async (req, res, next) => {
  try {
    // Check if pool is available
    if (!pool) {
      console.error('Database pool not initialized');
      return res.status(500).render('error', { 
        title: 'Database Error', 
        message: 'Database connection not available. Please try again later.' 
      });
    }

    // Pull active rows from the projects table
    const [rows] = await pool.query('SELECT * FROM `projects` WHERE active = 1 ORDER BY id DESC LIMIT 48');

    // Map database column names to the names your EJS template uses
    const photos = rows.map(r => ({
      id: r.id ?? r.project_id ?? r.pid ?? null,
      title: r.project_name ?? r.title ?? r.name ?? r.project_title ?? 'Untitled',
      image_url: r.img_url ?? r.image_url ?? r.image ?? r.image_path ?? r.thumbnail ?? r.img ?? '',
      caption: r.project_description ?? r.caption ?? r.description ?? r.summary ?? '',
      created_at: r.open_date_gmt ?? r.created_at ?? r.created ?? r.date ?? r.timestamp ?? null,
    }));

    console.log(`[gallery] Loaded ${photos.length} photos`);
    res.render('gallery', { title: 'Gallery', photos });
  } catch (err) {
    console.error('[gallery] DB error:', err);
    
    // Provide more specific error handling
    if (err.code === 'ECONNREFUSED') {
      return res.status(500).render('error', { 
        title: 'Database Connection Error', 
        message: 'Unable to connect to database. Please check your database configuration.' 
      });
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).render('error', { 
        title: 'Database Authentication Error', 
        message: 'Database authentication failed. Please check your credentials.' 
      });
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      return res.status(500).render('error', { 
        title: 'Database Error', 
        message: 'Database not found. Please check your database name.' 
      });
    }
    
    next(err);
  }
});

module.exports = router;
