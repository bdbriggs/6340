// app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

/* ===== Views + Static ===== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));                 // /views
app.use(express.static(path.join(__dirname, 'public')));         // /public -> /

/* ===== Parsers (must be before routes) ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ===== Optional: quick SMTP verify on boot (comment out later) ===== */
if (process.env.SMTP_HOST) {
  const bootTx = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,               // Gmail: 465 = true
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  bootTx.verify((err) => {
    if (err) console.error('[smtp.verify] FAILED:', err.message || err);
    else console.log('[smtp.verify] OK: ready to send');
  });
}

/* ===== Debug helpers ===== */
app.get('/__ping',  (req, res) => res.type('text').send('pong'));
app.get('/__where', (req, res) => res.json({ viewsDir: app.get('views'), cwd: process.cwd() }));

/* ===== DB boot (professor's utils/database.js) ===== */
(async () => {
  try {
    const { connect } = require('./utils/database.js');
    await connect();                          // sets up the mysql2 pool
    console.log('[db] connected');
  } catch (e) {
    console.error('[db] connection failed:', e);
  }
})();

/* ===== Page routes ===== */
app.get('/',         (req, res) => res.render('index',    { title: 'Home' }));
app.get('/featured', (req, res) => res.render('featured', { title: 'Featured' }));
app.get('/about',    (req, res) => res.render('about',    { title: 'About' }));
app.get('/contact',  (req, res) => res.render('contact',  { title: 'Contact' }));
app.get('/test',     async (req, res) => {
  try {
    const { pool } = require('./utils/database');
    const [rows] = await pool.query('SELECT * FROM `projects` WHERE active = 1 ORDER BY id DESC LIMIT 48');
    const photos = rows.map(r => ({
      id: r.id ?? r.project_id ?? r.pid ?? null,
      title: r.project_name ?? r.title ?? r.name ?? r.project_title ?? 'Untitled',
      image_url: r.img_url ?? r.image_url ?? r.image ?? r.image_path ?? r.thumbnail ?? r.img ?? '',
      caption: r.project_description ?? r.caption ?? r.description ?? r.summary ?? '',
      created_at: r.open_date_gmt ?? r.created_at ?? r.created ?? r.date ?? r.timestamp ?? null,
    }));
    res.render('test', { title: 'Test', photos });
  } catch (err) {
    console.error('Test page error:', err);
    res.render('test', { title: 'Test', photos: null });
  }
});

/* ===== Image pages ===== */
app.get('/popart',       (req, res) => res.render('popart',       { title: 'Pop Art Dumpster Fire' }));
app.get('/redrectangles', (req, res) => res.render('redrectangles', { title: 'Red Rectangles' }));
app.get('/sakura',       (req, res) => res.render('sakura',       { title: 'Sakura' }));

/* ===== Game pages ===== */
app.get('/chomper',      (req, res) => res.render('chomper-game', { title: 'Chomper - Play Now' }));
app.get('/rocketboost',   (req, res) => res.render('rocketboost-game', { title: 'Rocket Boost - Play Now' }));
app.get('/fuegofury',    (req, res) => res.render('fuegofury-game', { title: 'Fuego Fury - Play Now' }));
app.get('/ricochet',     (req, res) => res.render('ricochet-game', { title: 'Ricochet - Play Now' }));

const galleryRouter = require("./routes/gallery");
const gamesRouter = require("./routes/games");
const healthRouter = require("./health-check");
app.use(galleryRouter);
app.use('/games', gamesRouter);
app.use(healthRouter);

/* ===== API: Contact form (JSON) ===== */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, consent, company } = req.body || {};
    
    // Honeypot check (bot detection)
    if (company) return res.json({ ok: true }); 
    
    // Validation
    if (!name || !email || !subject || !message || consent !== true) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[contact] SMTP not configured, logging contact form submission');
      console.log('[contact] Submission:', { name, email, subject, message });
      return res.json({ ok: true, message: 'Contact form received (email not configured)' });
    }

    // Create transporter with better error handling
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      // Add timeout and connection options
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('[contact] SMTP connection verified');
    } catch (verifyErr) {
      console.error('[contact] SMTP verification failed:', verifyErr.message);
      return res.status(500).json({ 
        ok: false, 
        error: 'Email service temporarily unavailable. Please try again later.' 
      });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `[Site Contact] ${subject} — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p>${String(message || '').replace(/\n/g, '<br>')}</p>`,
    });

    console.log('[contact] sent successfully:', info.messageId);
    return res.json({ ok: true });
    
  } catch (err) {
    console.error('POST /api/contact error:', err);
    
    // Provide more specific error messages
    if (err.code === 'EAUTH') {
      return res.status(500).json({ 
        ok: false, 
        error: 'Email authentication failed. Please check SMTP settings.' 
      });
    } else if (err.code === 'ECONNECTION') {
      return res.status(500).json({ 
        ok: false, 
        error: 'Unable to connect to email server. Please try again later.' 
      });
    } else {
      return res.status(500).json({ 
        ok: false, 
        error: 'Email send failed. Please try again later.' 
      });
    }
  }
});

/* ===== 404 (keep LAST) ===== */
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'Not found' });
  }
  res.status(404).send('404 Not Found');
});

module.exports = app;
