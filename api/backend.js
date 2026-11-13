// RQA BOT backend (Vercel serverless) -> /r (rewritten to /api/backend.js)
const crypto = require("crypto");

const SIGNAL_BASE = "https://magic-scripts-live.vercel.app/s";
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const APPROVED_ENV = (process.env.APPROVED_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
const FIREBASE_BASE_URL = "https://rqa-bot-admin-default-rtdb.firebaseio.com";

const ID_RE = /^\d{20}$/;
const PAIR_RE = /^[a-z0-9_]{3,30}$/;
const TF_OK = ["5S", "10S", "15S", "30S", "1M", "2M", "3M", "5M", "10M", "15M"];
const SIGNAL_GAP_SEC = 3;

const memRate = new Map();
async function rateOk(id) {
  const now = Date.now(), last = memRate.get(id) || 0;
  if (now - last < SIGNAL_GAP_SEC * 1000) return false;
  memRate.set(id, now);
  if (memRate.size > 5000) memRate.clear();
  return true;
}

/* ---------- Firebase Helpers ---------- */
async function getSignalKey() {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/settings/signalKey.json`);
    if (res.ok) {
      const val = await res.json();
      if (val) return String(val).trim();
    }
  } catch (e) {
    console.error("Signal key fetch error:", e);
  }
  // Fallback environment variable agar Firebase fetch fail ho jaye
  return process.env.SIGNAL_KEY || "Ahmad Bhai0";
}

async function getFirebaseUser(id) {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/users.json`);
    if (!res.ok) return null;
    const allUsers = await res.json();
    if (!allUsers) return null;
    
    for (let key in allUsers) {
      if (allUsers[key] && String(allUsers[key].id).trim() === String(id).trim()) {
        return { key, data: allUsers[key] };
      }
    }
  } catch (e) {
    console.error("Firebase fetch error:", e);
  }
  return null;
}

async function isApproved(id) {
  if (APPROVED_ENV.includes(id)) return true;
  const user = await getFirebaseUser(id);
  if (user && user.data && user.data.status === "active") {
    return true;
  }
  return false;
}

function cleanTelemetry(raw) {
  if (!raw || raw.length > 1500) return null;
  let o;
  try { o = JSON.parse(raw); } catch { return null; }
  const s = v => String(v ?? "").slice(0, 80);
  return { status: s(o.status), activity: s(o.activity), pair: s(o.pair), time: s(o.time), lastSignal: s(o.lastSignal), at: Date.now() };
}

const parse = v => { try { return JSON.parse(v); } catch { return null; } };

function sendText(res, code, text) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.status(code).send(text);
}

/* ---------- Handler ---------- */
module.exports = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ status: "error", message: "Method not allowed" });

    const q = req.query || {};
    const action = String(q.action || "check");
    const id = String(q.id || "").trim();

    if (!ID_RE.test(id)) {
      return sendText(res, 400, "N");
    }

    // Client & Device Extraction for Logs/Telemetry
    const rawUserAgent = req.headers['user-agent'] || '';
    const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();

    let os = "Unknown OS";
    if (/windows nt/i.test(rawUserAgent)) os = "Windows PC";
    else if (/macintosh|mac os x/i.test(rawUserAgent)) os = "macOS";
    else if (/android/i.test(rawUserAgent)) os = "Android Mobile";
    else if (/iphone|ipad|ipod/i.test(rawUserAgent)) os = "iOS Device";
    else if (/linux/i.test(rawUserAgent)) os = "Linux";

    let browser = "Unknown Browser";
    if (/edg/i.test(rawUserAgent)) browser = "Microsoft Edge";
    else if (/chrome|crios/i.test(rawUserAgent) && !/edg/i.test(rawUserAgent)) browser = "Google Chrome";
    else if (/safari/i.test(rawUserAgent) && !/chrome|crios/i.test(rawUserAgent)) browser = "Apple Safari";
    else if (/firefox|fxios/i.test(rawUserAgent)) browser = "Mozilla Firefox";

    // Update Firebase User Logs / Telemetry in background
    const firebaseUser = await getFirebaseUser(id);
    if (firebaseUser) {
      const now = new Date();
      const currentLog = {
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi' }),
        time: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' }),
        ip: clientIp,
        device: `${os} | ${browser}`,
        status: firebaseUser.data.status === "active" ? "Unlocked (Active)" : "Locked (Inactive)"
      };

      let existingLogs = [];
      if (firebaseUser.data.logs && typeof firebaseUser.data.logs === 'object') {
        existingLogs = Array.isArray(firebaseUser.data.logs) ? firebaseUser.data.logs : Object.values(firebaseUser.data.logs);
      }
      existingLogs.unshift(currentLog);
      const updatedLogs = existingLogs.slice(0, 5);

      const updateData = {
        lastSeen: now.toISOString(),
        lastIp: clientIp,
        lastDevice: `${os} | ${browser}`,
        userAgent: rawUserAgent,
        logs: updatedLogs
      };

      if (q.telemetry) {
        const t = cleanTelemetry(String(q.telemetry));
        if (t) updateData.telemetry = t;
      }

      fetch(`${FIREBASE_BASE_URL}/users/${firebaseUser.key}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }).catch(() => {});
    }

    // Action: Signal Request
    if (action === "signal") {
      if (!(await isApproved(id))) {
        return res.status(403).json({ status: "error", message: "Device not approved" });
      }

      const pair = String(q.pair || "").toLowerCase();
      const tf = String(q.tf || "").toUpperCase();
      if (!PAIR_RE.test(pair)) return res.status(400).json({ status: "error", message: "Invalid pair" });
      if (!TF_OK.includes(tf)) return res.status(400).json({ status: "error", message: "Invalid timeframe" });
      if (!(await rateOk(id))) return res.status(429).json({ status: "error", message: "Too many requests. Please wait a few seconds." });

      // Firebase se dynamic signal key fetch ho rahi hai
      const activeSignalKey = await getSignalKey();

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      try {
        const url = `${SIGNAL_BASE}?pair=${encodeURIComponent(pair)}&tf=${encodeURIComponent(tf)}&key=${encodeURIComponent(activeSignalKey)}`;
        const r = await fetch(url, { signal: ctrl.signal });
        const j = parse(await r.text());
        if (!j) return res.status(502).json({ status: "error", message: "Signal service returned an invalid response" });
        return res.status(r.ok ? 200 : r.status).json(j);
      } catch (e) {
        const to = e.name === "AbortError";
        return res.status(to ? 504 : 502).json({ status: "error", message: to ? "Signal service timed out" : "Could not reach the signal service" });
      } finally {
        clearTimeout(timer);
      }
    }

    /* Default: Approval Check -> Returns "R" if active, otherwise "N" */
    const ok = await isApproved(id);
    return sendText(res, 200, ok ? "R" : "N");

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ status: "error", message: err.message || "Internal server error" });
  }
};
