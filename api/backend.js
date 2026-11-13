// RQA BOT backend (Vercel serverless)  ->  /r  (rewritten to /api/backend.js)
//
//  GET /r?id=<20 digits>                       -> "R" (approved) or "N"   (+ optional &telemetry=<json>)
//  GET /r?action=signal&id=..&pair=..&tf=..    -> signal JSON (approved devices only, key stays here)
//  Admin (header x-admin-key or ?admin=KEY):
//  GET /r?action=list | approve&id=.. | revoke&id=..
//
// Env vars (Vercel > Settings > Environment Variables):
//  SIGNAL_KEY         signal API key (fallback below is used if unset)
//  ADMIN_KEY          secret for admin actions
//  APPROVED_IDS       optional, comma separated device IDs that are always approved
//  APPROVAL_UPSTREAM  optional, e.g. https://rqa-contacts.vercel.app/r?id=  (keeps your old approval server working)
//  KV_REST_API_URL / KV_REST_API_TOKEN (Vercel KV / Upstash) -> enables approve/revoke/list + shared rate limit

const crypto = require("crypto");

const SIGNAL_BASE = "https://magic-scripts-live.vercel.app/s";
const SIGNAL_KEY = process.env.SIGNAL_KEY || "Ahmad Bhai00";
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const APPROVED_ENV = (process.env.APPROVED_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
const UPSTREAM = process.env.APPROVAL_UPSTREAM || "";
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

const ID_RE = /^\d{20}$/;
const PAIR_RE = /^[a-z0-9_]{3,30}$/;
const TF_OK = ["5S", "10S", "15S", "30S", "1M", "2M", "3M", "5M", "10M", "15M"];
const SIGNAL_GAP_SEC = 3;                       // min seconds between signal requests per device

/* ---------- tiny Redis REST helper (optional) ---------- */
async function kv(cmd, pipeline = false) {
  if (!KV_URL) return null;
  try {
    const r = await fetch(pipeline ? KV_URL + "/pipeline" : KV_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + KV_TOKEN },
      body: JSON.stringify(cmd),
    });
    const j = await r.json();
    return pipeline ? j : j.result;
  } catch { return null; }
}

const memRate = new Map();
async function rateOk(id) {
  if (KV_URL) return (await kv(["SET", "rl:" + id, "1", "NX", "EX", SIGNAL_GAP_SEC])) === "OK";
  const now = Date.now(), last = memRate.get(id) || 0;
  if (now - last < SIGNAL_GAP_SEC * 1000) return false;
  memRate.set(id, now);
  if (memRate.size > 5000) memRate.clear();
  return true;
}

async function isApproved(id) {
  if (APPROVED_ENV.includes(id)) return true;
  if (KV_URL && (await kv(["GET", "approved:" + id]))) return true;
  if (UPSTREAM) {
    try {
      const r = await fetch(UPSTREAM + id + "&t=" + Date.now());
      return r.ok && (await r.text()).trim() === "R";
    } catch {}
  }
  return false;
}

function cleanTelemetry(raw) {
  if (!raw || raw.length > 1500) return null;
  let o; try { o = JSON.parse(raw); } catch { return null; }
  const s = v => String(v ?? "").slice(0, 80);
  return { status: s(o.status), activity: s(o.activity), pair: s(o.pair), time: s(o.time), lastSignal: s(o.lastSignal), at: Date.now() };
}

function adminOk(req) {
  const given = String(req.headers["x-admin-key"] || req.query.admin || "");
  if (!ADMIN_KEY || !given) return false;
  const a = Buffer.from(given), b = Buffer.from(ADMIN_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const parse = v => { try { return JSON.parse(v); } catch { return null; } };

/* ---------- handler ---------- */
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "x-admin-key");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ status: "error", message: "Method not allowed" });

  const q = req.query || {};
  const action = String(q.action || "check");
  const id = String(q.id || "");

  /* admin */
  if (["list", "approve", "revoke"].includes(action)) {
    if (!adminOk(req)) return res.status(401).json({ status: "error", message: "Unauthorized" });
    if (!KV_URL) return res.status(501).json({ status: "error", message: "Storage not configured. Add Vercel KV/Upstash or use APPROVED_IDS." });

    if (action === "list") {
      const ids = ((await kv(["SMEMBERS", "devices"])) || []).slice(0, 200);
      const out = ids.length ? await kv(ids.flatMap(i => [["GET", "seen:" + i], ["GET", "approved:" + i]]), true) : [];
      const rows = ids.map((i, n) => ({
        id: i,
        approved: APPROVED_ENV.includes(i) || !!(out[n * 2 + 1] && out[n * 2 + 1].result),
        seen: parse(out[n * 2] && out[n * 2].result),
      })).sort((a, b) => ((b.seen && b.seen.at) || 0) - ((a.seen && a.seen.at) || 0));
      return res.json({ status: "success", count: rows.length, devices: rows });
    }
    if (!ID_RE.test(id)) return res.status(400).json({ status: "error", message: "Invalid device id" });
    if (action === "approve") { await kv(["SET", "approved:" + id, "1"]); await kv(["SADD", "devices", id]); }
    else await kv(["DEL", "approved:" + id]);
    return res.json({ status: "success", id, approved: action === "approve" });
  }

  /* device */
  if (!ID_RE.test(id)) return res.status(400).type("text/plain").send("N");

  if (q.telemetry && KV_URL) {
    const t = cleanTelemetry(String(q.telemetry));
    if (t) {
      await kv([["SADD", "devices", id], ["SET", "seen:" + id, JSON.stringify(t), "EX", 604800]], true);
    }
  }

  if (action === "signal") {
    if (!(await isApproved(id))) return res.status(403).json({ status: "error", message: "Device not approved" });

    const pair = String(q.pair || "").toLowerCase();
    const tf = String(q.tf || "").toUpperCase();
    if (!PAIR_RE.test(pair)) return res.status(400).json({ status: "error", message: "Invalid pair" });
    if (!TF_OK.includes(tf)) return res.status(400).json({ status: "error", message: "Invalid timeframe" });
    if (!(await rateOk(id))) return res.status(429).json({ status: "error", message: "Too many requests. Please wait a few seconds." });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const url = `${SIGNAL_BASE}?pair=${encodeURIComponent(pair)}&tf=${encodeURIComponent(tf)}&key=${encodeURIComponent(SIGNAL_KEY)}`;
      const r = await fetch(url, { signal: ctrl.signal });
      const j = parse(await r.text());
      if (!j) return res.status(502).json({ status: "error", message: "Signal service returned an invalid response" });
      return res.status(r.ok ? 200 : r.status).json(j);
    } catch (e) {
      const to = e.name === "AbortError";
      return res.status(to ? 504 : 502).json({ status: "error", message: to ? "Signal service timed out" : "Could not reach the signal service" });
    } finally { clearTimeout(timer); }
  }

  /* default: approval check -> "R" / "N" */
  const ok = await isApproved(id);
  return res.status(200).type("text/plain").send(ok ? "R" : "N");
};
