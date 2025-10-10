// routes/gallery.js
const express = require('express');
const { pool } = require('../utils/database');

const router = express.Router();

router.get('/gallery', async (req, res, next) => {
  try {
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

    res.render('gallery', { title: 'Gallery', photos });
  } catch (err) {
    console.error('DB error:', err);
    next(err);
  }
});

module.exports = router;
