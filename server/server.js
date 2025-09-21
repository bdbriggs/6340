// server/server.js — Gmail SMTP version (CommonJS)
// Requires: npm i express nodemailer dotenv cors

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors({ origin: true })); // allow Live Server (5500) to call 3000 in dev
app.use(express.json());

console.log("BOOT FILE:", __filename);

// Health + env peek (helps verify .env is loaded)
app.get("/api/health", (_req, res) => res.json({ ok: true, transport: "gmail" }));
app.get("/api/_debug_env", (_req, res) => {
  res.json({
    user: process.env.EMAIL_USER || null,
    passLen: process.env.EMAIL_PASS ? String(process.env.EMAIL_PASS).length : 0,
    port: process.env.PORT || 3000,
  });
});

// Contact endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  // Gmail SMTP with App Password (NOT the 6‑digit 2FA code)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,          // STARTTLS
    requireTLS: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { minVersion: "TLSv1.2" },
    logger: true,           // verbose SMTP logs in terminal (dev only)
    debug: true,
  });

  try {
    await transporter.verify(); // surfaces auth/policy errors clearly

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // must equal the Gmail account used above
      to: process.env.EMAIL_USER,   // send to yourself
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `From: ${name} <${email}>

${message}`,
    });

    console.log("✅ Mail sent:", info && info.messageId);
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ SENDMAIL ERROR:", err && err.message);
    if (err && err.response) console.error("SMTP:", err.response.toString());
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : "Email failed to send" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
