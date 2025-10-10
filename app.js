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

/* ===== Image pages ===== */
app.get('/popart',       (req, res) => res.render('popart',       { title: 'Pop Art Dumpster Fire' }));
app.get('/redrectangles', (req, res) => res.render('redrectangles', { title: 'Red Rectangles' }));
app.get('/sakura',       (req, res) => res.render('sakura',       { title: 'Sakura' }));

const galleryRouter = require("./routes/gallery");
app.use(galleryRouter);

/* ===== API: Contact form (JSON) ===== */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, consent, company } = req.body || {};
    if (company) return res.json({ ok: true }); // bot → pretend success
    if (!name || !email || !subject || !message || consent !== true) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

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

    console.log('[contact] sent:', info.messageId, info.response);
    return res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/contact error:', err);
    return res.status(500).json({ ok: false, error: 'Email send failed.' });
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
