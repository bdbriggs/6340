// server.js — Nodemailer (Gmail App Password) backend
// Folder should contain: server.js, package.json, .env
// npm i express cors nodemailer dotenv

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

/* ===== Middleware ===== */
app.use(cors({ origin: true }));        // Dev: allow any origin. Lock down in prod.
app.use(express.json({ limit: "10kb" })); // Parse JSON bodies

/* ===== Health / Debug ===== */
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, transport: "gmail", ts: Date.now() })
);

app.get("/api/_debug_env", (_req, res) => {
  res.json({
    user: process.env.EMAIL_USER || null,
    passLen: process.env.EMAIL_PASS ? String(process.env.EMAIL_PASS).length : 0,
    port: process.env.PORT || 3000,
  });
});

/* ===== Mail Transport (Gmail via App Password) ===== */
function makeTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,                 // SSL
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // e.g. fuegothedumpsterfire@gmail.com
      pass: process.env.EMAIL_PASS, // 16-char App Password (no spaces)
    },
    tls: { minVersion: "TLSv1.2" },
    family: 4,                 // Force IPv4 (helps avoid ETIMEDOUT on some nets)
    connectionTimeout: 15000,  // 15s connect timeout
    greetingTimeout: 15000,
    socketTimeout: 20000,
    logger: true,              // Verbose SMTP logs (dev). Turn off in prod if noisy.
    debug: true,
  });
}

/* ===== Routes ===== */
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message, consent, company } = req.body || {};

  // Honeypot: if bot fills "company", pretend success without sending
  if (company) return res.json({ ok: true });

  // Basic validation
  if (!name || !email || !subject || !message || consent !== true) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  const transporter = makeTransport();

  try {
    await transporter.verify(); // catches auth/policy/connection problems early

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,       // must match Gmail account used above
      to: process.env.EMAIL_USER,         // send to yourself
      replyTo: email,                     // so you can reply directly
      subject: `Contact: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      // html: optional rich version
    });

    console.log("✅ Mail sent:", info && info.messageId);
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ SENDMAIL ERROR:", err?.message);
    if (err?.response) console.error("SMTP:", String(err.response));
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Email failed to send" });
  }
});

/* ===== Start ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
