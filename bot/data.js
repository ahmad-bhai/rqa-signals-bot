module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const queryId = req.query.id;

    try {
        // Agar URL mein ID pass nahi hui, toh LocalStorage/Device ID Sync Script load hogi
        if (!queryId) {
            return res.send(getDeviceSyncScript());
        }

        const userId = queryId.trim();

        // Verification API Call
        const verifyUrl = `https://rqa-contacts.vercel.app/r?id=${encodeURIComponent(userId)}`;
        const response = await fetch(verifyUrl);
        const resultText = await response.text();
        const result = resultText.trim();

        // Exact 'F' response = Access Granted (Dashboard), nahi toh Exact Lock Screen
        if (result === 'F') {
            return res.send(getMainHTML(userId));
        } else {
            return res.send(getLockHTML(userId));
        }
    } catch (error) {
        return res.send(getLockHTML(queryId || ''));
    }
};

// ── 0. DEVICE ID GENERATION & SYNC SCRIPT ──
function getDeviceSyncScript() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RQA BOT - Initializing</title>
    <style>
        body { background: #09090b; color: #f59e0b; font-family: sans-serif; display: flex; height: 100vh; align-items: center; justify-content: center; margin: 0; }
        .loader { border: 3px solid rgba(245, 158, 11, 0.2); border-top-color: #f59e0b; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="loader"></div>
    <script>
        (function() {
            let deviceId = localStorage.getItem('rqa_device_id');
            if (!deviceId || deviceId.length !== 20) {
                // 20-Digit Unique ID Generator
                deviceId = '';
                const chars = '0123456789';
                for (let i = 0; i < 20; i++) {
                    deviceId += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                localStorage.setItem('rqa_device_id', deviceId);
            }
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('id', deviceId);
            window.location.replace(currentUrl.toString());
        })();
    </script>
</body>
</html>`;
}

// ── 1. EXACT LOCK HTML TEMPLATE ──
function getLockHTML(userId) {
    const idToDisplay = userId || '{id}';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lock Screen</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght=700;900&family=Rajdhani:wght=600;700&display=swap" rel="stylesheet">
</head>
<body>

<script>
(function () {
    // Save or sync ID locally if passed
    if ('${userId}' && '${userId}' !== '{id}') {
        localStorage.setItem('rqa_device_id', '${userId}');
    }

    function injectStyles() {
        if (document.getElementById('lock-screen-styles')) return;

        const style = document.createElement('style');
        style.id = 'lock-screen-styles';
        style.textContent = \`
            :root { 
                --gold: #f59e0b; 
                --gold-light: #fbbf24;
                --orange: #ea580c; 
                --dark: #09090b; 
                --border: rgba(245, 158, 11, 0.25); 
                --text: #fef3c7; 
                --muted: #a1a1aa; 
            } 

            #lockScreen {
                position: fixed; 
                inset: 0; 
                z-index: 99999;
                background: radial-gradient(ellipse at 50% 20%, #291504 0%, var(--dark) 70%);
                display: flex; 
                flex-direction: column;
                align-items: center; 
                justify-content: center; 
                padding: 28px 20px;
                font-family: 'Rajdhani', sans-serif;
                color: var(--text);
                box-sizing: border-box;
            }

            .lock-logo-ring {
                width: 105px;
                height: 105px;
                border-radius: 50%;
                border: 2px solid var(--gold);
                background: url('logo.png') no-repeat center center;
                background-size: cover;
                margin-bottom: 24px;
                box-shadow: 0 0 40px rgba(245, 158, 11, 0.3);
                animation: lockGlow 2s infinite;
            }

            @keyframes lockGlow {
                0%, 100% { 
                    box-shadow: 0 0 25px rgba(245, 158, 11, 0.3); 
                    border-color: var(--gold);
                }
                50% { 
                    box-shadow: 0 0 55px rgba(234, 88, 12, 0.6); 
                    border-color: var(--orange); 
                }
            }

            .lock-title { 
                font-family: 'Orbitron', sans-serif; 
                font-size: 18px; 
                letter-spacing: 2px; 
                color: var(--gold-light); 
                margin-bottom: 4px; 
                text-shadow: 0 0 10px rgba(245, 158, 11, 0.4); 
                text-align: center; 
            }

            .lock-sub { 
                font-size: 13px; 
                color: var(--muted); 
                margin-bottom: 20px; 
                text-align: center; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
            }

            .id-box {
                width: 100%; 
                max-width: 340px;
                background: rgba(245, 158, 11, 0.04);
                border: 1.5px solid var(--border);
                border-radius: 18px; 
                padding: 20px;
                text-align: center; 
                margin-bottom: 16px;
                box-sizing: border-box;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            
            .id-box-label { 
                font-size: 10px; 
                color: var(--muted); 
                letter-spacing: 2px; 
                margin-bottom: 10px; 
                text-transform: uppercase; 
            }

            .id-number {
                font-family: 'Orbitron', sans-serif; 
                font-size: 16px; 
                font-weight: 700;
                color: var(--gold); 
                letter-spacing: 3px; 
                word-break: break-all;
                line-height: 1.5; 
                user-select: all;
                text-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
            }

            .copy-btn {
                margin-top: 14px; 
                width: 100%; 
                padding: 13px;
                background: linear-gradient(135deg, var(--orange), var(--gold));
                border: none; 
                border-radius: 12px; 
                cursor: pointer;
                font-family: 'Orbitron', sans-serif; 
                font-size: 12px; 
                font-weight: 700;
                color: #09090b; 
                letter-spacing: 2px; 
                transition: transform 0.15s;
                box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
                display: flex; 
                align-items: center; 
                justify-content: center;
            }

            .copy-btn:active { transform: scale(0.97); }

            .pending-box {
                width: 100%; 
                max-width: 340px;
                background: rgba(245, 158, 11, 0.03);
                border: 1px solid rgba(245, 158, 11, 0.15);
                border-radius: 16px; 
                padding: 16px 18px;
                text-align: center;
                backdrop-filter: blur(10px);
                box-sizing: border-box;
            }

            .pending-spinner {
                display: inline-block; 
                width: 18px; 
                height: 18px;
                border: 2px solid rgba(245, 158, 11, 0.2);
                border-top-color: var(--gold);
                border-radius: 50%; 
                animation: lockSpin 0.9s linear infinite;
                vertical-align: middle; 
                margin-right: 8px;
            }

            @keyframes lockSpin { to { transform: rotate(360deg); } }

            .pending-text { font-size: 12px; color: var(--muted); display: inline; vertical-align: middle; }

            .contact-wrap {
                width: 100%;
                max-width: 340px;
                margin-top: 16px;
                text-align: center;
            }

            .contact-label {
                font-size: 10px;
                color: var(--muted);
                letter-spacing: 2px;
                margin-bottom: 6px;
                text-transform: uppercase;
                text-align: left;
                padding-left: 4px;
            }

            .contact-link {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 13px;
                border-radius: 12px;
                text-decoration: none;
                font-family: 'Orbitron', sans-serif;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1px;
                transition: all 0.2s ease;
                box-sizing: border-box;
            }

            .tg-admin {
                background: rgba(245, 158, 11, 0.06);
                border: 1.5px solid var(--border);
                color: var(--text);
            }

            .tg-admin:hover, .tg-admin:active {
                background: rgba(245, 158, 11, 0.15);
                border-color: var(--gold);
                box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
                transform: scale(0.98);
            }

            .tg-channel {
                background: linear-gradient(135deg, #1d2733, #243447);
                border: 1.5px solid #229ED9;
                color: #229ED9;
                text-shadow: 0 0 10px rgba(34, 158, 217, 0.3);
            }

            .tg-channel:hover, .tg-channel:active {
                background: #229ED9;
                color: #09090b;
                text-shadow: none;
                box-shadow: 0 0 20px rgba(34, 158, 217, 0.4);
                transform: scale(0.98);
            }
        \`;
        document.head.appendChild(style);
    }

    function showLockScreen(userId) {
        injectStyles();

        let lockDiv = document.getElementById('lockScreen');
        if (!lockDiv) {
            lockDiv = document.createElement('div');
            lockDiv.id = 'lockScreen';
            document.body.appendChild(lockDiv);
        }

        const displayId = userId || '${idToDisplay}';

        lockDiv.innerHTML = \`
            <div class="lock-logo-ring"></div>
            <div class="lock-title">LOCKED</div>
            <div class="lock-sub">
                <svg style="width:14px;height:14px;vertical-align:middle;margin-right:4px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                CONTACT TO UNLOCK !!!
                <svg style="width:14px;height:14px;vertical-align:middle;margin-left:4px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>

            <div class="id-box">
                <div class="id-box-label">Your Device ID</div>
                <div class="id-number">\${displayId}</div>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('\${displayId}')">
                    <svg style="width:14px;height:14px;vertical-align:middle;margin-right:6px;fill:#09090b;" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    COPY ID & SEND TO ADMIN
                </button>
            </div>

            <div class="pending-box">
                <div class="pending-spinner"></div>
                <div class="pending-text">Waiting for admin approval...</div>
            </div>

            <div class="contact-wrap">
                <div class="contact-label">CONTACT FOR APPROVAL</div>
                <a href="https://rqa-contacts.vercel.app/" target="_blank" class="contact-link tg-admin">
                    <span>
                        <svg style="width:13px;height:13px;vertical-align:middle;margin-right:4px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                        Contact Admin: @RQA_OFFICIAL
                    </span>
                </a>
                
                <div class="contact-label" style="margin-top: 14px;">JOIN OFFICIAL CHANNEL</div>
                <a href="https://rqa-contacts.vercel.app/" target="_blank" class="contact-link tg-channel">
                    <span>
                        <svg style="width:13px;height:13px;vertical-align:middle;margin-right:4px;fill:#229ED9;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27 0-.12.07-1.99 1.25-5.62 3.69-.53.36-1.01.54-1.44.53-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.08-.78 4.22-1.84 7.03-3.05 8.43-3.64 4.01-1.68 4.84-1.97 5.38-1.98.12 0 .39.03.56.17.14.12.18.28.2.45-.02.07-.02.13-.04.2z"/></svg>
                        Join Telegram Channel
                    </span>
                </a>
            </div>
        \`;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { showLockScreen('${idToDisplay}'); });
    } else {
        showLockScreen('${idToDisplay}');
    }
})();
</script>

</body>
</html>`;
}

// ── 2. MAIN BOT DASHBOARD HTML TEMPLATE ──
function getMainHTML(userId) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="theme-color" content="#EC640C">
    <meta name="color-scheme" content="dark">
    <title>RQA BOT</title>
    <link rel="apple-touch-icon" sizes="180x180" href="logo.png">
    <link rel="shortcut icon" href="logo.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght=700;900&family=Rajdhani:wght=500;600;700&display=swap" rel="stylesheet">
    <style>
    :root { 
        --gold: #f59e0b; 
        --gold-light: #fbbf24;
        --orange: #ea580c; 
        --dark: #09090b; 
        --card: #18181b; 
        --border: rgba(245, 158, 11, 0.25); 
        --up: #10b981; 
        --down: #ef4444; 
        --text: #fef3c7; 
        --muted: #a1a1aa; 
    } 
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; } 
    html, body { height: 100%; } 
    body { 
        background: var(--dark); font-family: 'Rajdhani', sans-serif; color: var(--text); overflow-x: hidden; 
        background-image: radial-gradient(circle at 10% 20%, rgba(234, 88, 12, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 40%);
    } 

    .user-id-banner {
        background: rgba(245, 158, 11, 0.08); border-bottom: 1px solid var(--border);
        text-align: center; padding: 8px 12px; font-family: 'Orbitron', sans-serif;
        font-size: 12px; font-weight: 700; color: var(--gold-light); letter-spacing: 1.5px;
    }

    #app { display: flex; flex-direction: column; min-height: 100vh; max-width: 460px; margin: 0 auto; padding: 0 0 90px 0; }
    .header {
        padding: 16px 20px 14px; background: linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(9,9,11,0.8) 100%);
        border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 14px;
        position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px);
    }
    .header-logo { width:46px; height:46px; border-radius:50%; background: url('logo.png') no-repeat center center; background-size: cover; flex-shrink:0; box-shadow:0 0 20px rgba(245,158,11,0.4); border: 1.5px solid var(--gold); }
    .header-info { flex:1; }
    .header-title { font-family:'Orbitron',sans-serif; font-size:15px; font-weight:900; color:var(--gold-light); letter-spacing:1.5px; text-shadow: 0 0 10px rgba(245,158,11,0.3); }
    .header-sub { font-size:11px; color:var(--muted); margin-top:2px; }
    .header-live { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--up); font-weight:600; }
    .live-dot { width:7px; height:7px; border-radius:50%; background:var(--up); animation:blink 1s infinite; box-shadow: 0 0 8px var(--up); }
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

    .controls { padding:16px 16px 8px; display:flex; flex-direction:column; gap:10px; }
    .select-row { display:flex; gap:10px; }
    .custom-select { position:relative; flex:1; }
    .select-btn {
        width:100%; padding:14px 16px; background:var(--card); border:1.5px solid var(--border);
        color:var(--text); border-radius:14px; font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:600;
        display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:all 0.2s; white-space:nowrap; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .select-btn.open { border-color:var(--gold); box-shadow: 0 0 15px rgba(245,158,11,0.2); }
    .select-btn .label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .select-btn .arr { color:var(--gold); font-size:10px; flex-shrink:0; margin-left:6px; transition:transform 0.2s; }
    .select-btn.open .arr { transform:rotate(180deg); }
    .select-drop {
        display:none; position:absolute; width:100%; background:#121215; border:1.5px solid var(--gold);
        border-radius:14px; z-index:200; top:calc(100% + 6px); max-height:220px; overflow-y:auto; box-shadow:0 20px 50px rgba(0,0,0,0.8);
    }
    .select-drop.show { display:block; animation: dropFade 0.2s ease; }
    @keyframes dropFade { from{opacity:0; transform: translateY(-5px);} to{opacity:1; transform: translateY(0);} }
    .select-drop::-webkit-scrollbar { width:4px; }
    .select-drop::-webkit-scrollbar-thumb { background:var(--gold); border-radius:99px; }
    .drop-item { padding:13px 16px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; font-size:13px; font-weight:600; transition:background 0.15s,color 0.15s; }
    .drop-item:last-child { border-bottom:none; }
    .drop-item:hover,.drop-item.active { background:rgba(245,158,11,0.12); color:var(--gold); }

    .copy-btn {
        width: 100%; padding: 13px; background: linear-gradient(135deg, var(--orange), var(--gold));
        border: none; border-radius: 12px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700;
        color: #09090b; letter-spacing: 2px; transition: transform 0.15s; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        display: flex; align-items: center; justify-content: center;
    }
    .copy-btn:active { transform: scale(0.97); }

    .signal-wrap { padding:14px 16px; }
    .signal-card { background:var(--card); border:1.5px solid var(--border); border-radius:22px; overflow:hidden; position:relative; box-shadow: 0 15px 40px rgba(0,0,0,0.4); backdrop-filter: blur(10px); }
    .signal-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--orange),var(--gold),transparent); }
    .signal-top { padding:20px 20px 14px; display:flex; align-items:center; gap:14px; }
    .signal-icon { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:26px; flex-shrink:0; background:rgba(245,158,11,0.06); border:1px solid var(--border); }
    .signal-icon.up-icon { background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.25); }
    .signal-icon.down-icon { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.25); }
    .signal-info { flex:1; min-width:0; }
    .signal-pair { font-family:'Orbitron',sans-serif; font-size:15px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .signal-meta { font-size:12px; color:var(--muted); margin-top:3px; }
    .signal-dir { font-family:'Orbitron',sans-serif; font-size:18px; font-weight:900; padding:10px 16px; border-radius:12px; flex-shrink:0; }
    .signal-dir.UP { color:var(--up); background:rgba(16,185,129,0.12); border:1.5px solid rgba(16,185,129,0.3); text-shadow: 0 0 10px rgba(16,185,129,0.3); }
    .signal-dir.DOWN { color:var(--down); background:rgba(239,68,68,0.12); border:1.5px solid rgba(239,68,68,0.3); text-shadow: 0 0 10px rgba(239,68,68,0.3); }
    .signal-dir.WAIT { color:var(--gold); background:rgba(245,158,11,0.08); border:1.5px solid var(--border); font-size:13px; }

    .countdown-wrap { padding:0 20px 20px; }
    .countdown-label { font-size:11px; color:var(--muted); margin-bottom:6px; letter-spacing:1px; }
    .countdown-bar-bg { height:6px; background:rgba(255,255,255,0.05); border-radius:99px; overflow:hidden; margin-bottom:12px; border: 1px solid rgba(255,255,255,0.02); }
    .countdown-bar { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--orange),var(--gold)); transition:width 1s linear; }
    .countdown-bar.up { background:linear-gradient(90deg,#059669,var(--up)); box-shadow: 0 0 10px var(--up); }
    .countdown-bar.down { background:linear-gradient(90deg,#dc2626,var(--down)); box-shadow: 0 0 10px var(--down); }
    .countdown-num { font-family:'Orbitron',sans-serif; font-size:34px; font-weight:900; text-align:center; letter-spacing:2px; }
    .countdown-num.up { color:var(--up); text-shadow:0 0 25px rgba(16,185,129,0.5); }
    .countdown-num.down { color:var(--down); text-shadow:0 0 25px rgba(239,68,68,0.5); }
    .countdown-num.neutral { color:var(--gold); text-shadow:0 0 25px rgba(245,158,11,0.4); }

    .stats-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; padding:0 16px 14px; }
    .stat-box { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:12px 10px; text-align:center; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
    .stat-val { font-family:'Orbitron',sans-serif; font-size:15px; font-weight:700; color:var(--gold); text-shadow: 0 0 8px rgba(245,158,11,0.3); }
    .stat-lbl { font-size:10px; color:var(--muted); margin-top:3px; letter-spacing:0.5px; }

    .section-title { padding:6px 16px 10px; font-family:'Orbitron',sans-serif; font-size:11px; color:var(--gold); letter-spacing:2px; display:flex; align-items:center; gap:8px; }
    .section-title::after { content:''; flex:1; height:1px; background:var(--border); }

    .history-list { padding:0 16px; display:flex; flex-direction:column; gap:8px; }
    .hist-item { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:12px 16px; display:flex; align-items:center; gap:12px; animation:slideIn 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    .hist-dir { font-family:'Orbitron',sans-serif; font-size:11px; font-weight:700; padding:5px 10px; border-radius:8px; flex-shrink:0; }
    .hist-dir.UP { color:var(--up); background:rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); }
    .hist-dir.DOWN { color:var(--down); background:rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); }
    .hist-info { flex:1; min-width:0; }
    .hist-pair { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color: var(--text); }
    .hist-time { font-size:11px; color:var(--muted); margin-top:2px; }
    .hist-dur { font-size:11px; color:var(--gold); font-weight:600; flex-shrink:0; }

    .empty-state { text-align:center; padding:40px 20px; color:var(--muted); font-size:14px; }
    .empty-state .icon { font-size:42px; margin-bottom:12px; opacity:0.5; }

    #toast { position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(20px); background:linear-gradient(135deg,var(--orange),var(--gold)); color:#09090b; font-family:'Orbitron',sans-serif; font-size:12px; font-weight:700; letter-spacing:1.5px; padding:14px 28px; border-radius:50px; box-shadow:0 10px 30px rgba(245,158,11,0.4); opacity:0; transition:all 0.3s; z-index:9000; pointer-events:none; white-space:nowrap; }
    #toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

    .popup-overlay { position:fixed; inset:0; z-index:5000; background:rgba(9,9,11,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; opacity:0; pointer-events:none; transition:opacity 0.25s; }
    .popup-overlay.show { opacity:1; pointer-events:all; }
    .popup { background:var(--card); border:1.5px solid var(--gold); border-radius:24px; padding:28px 24px; width:100%; max-width:340px; text-align:center; transform:scale(0.92); transition:transform 0.25s; box-shadow:0 30px 80px rgba(0,0,0,0.8); }
    .popup-overlay.show .popup { transform:scale(1); }
    .popup-icon { font-size:50px; margin-bottom:14px; }
    .popup-title { font-family:'Orbitron',sans-serif; font-size:16px; font-weight:700; color:var(--gold); margin-bottom:8px; text-shadow: 0 0 10px rgba(245,158,11,0.3); }
    .popup-body { font-size:14px; color:var(--text); line-height:1.7; margin-bottom:22px; }
    .popup-pair { font-family:'Orbitron',sans-serif; font-size:22px; font-weight:900; margin:10px 0; }
    .popup-pair.UP { color:var(--up); text-shadow: 0 0 10px rgba(16,185,129,0.3); }
    .popup-pair.DOWN { color:var(--down); text-shadow: 0 0 10px rgba(239,68,68,0.3); }
    .popup-btn { padding:14px 32px; border:none; border-radius:12px; background:linear-gradient(135deg,var(--orange),var(--gold)); color:#09090b; font-family:'Orbitron',sans-serif; font-size:12px; font-weight:700; letter-spacing:2px; cursor:pointer; transition:transform 0.1s; box-shadow: 0 5px 20px rgba(234,88,12,0.4); }
    .popup-btn:active { transform:scale(0.97); }

    .pending-spinner { display: inline-block; width: 35px; height: 35px; border: 3px solid rgba(245, 158, 11, 0.2); border-top-color: var(--gold); border-radius: 50%; animation: lockSpin 0.9s linear infinite; }
    @keyframes lockSpin { to { transform: rotate(360deg); } }
</style>
</head>
<body>

    <div class="user-id-banner">
        YOUR ID IS ${userId}
    </div>

    <div id="app">
        <div class="header">
            <div class="header-logo"></div>
            <div class="header-info">
                <div class="header-title">RQA BOT</div>
                <div class="header-sub">Real Signal Bot</div>
            </div>
            <div class="header-live">
                <div class="live-dot"></div>ONLINE
            </div>
        </div>

        <div class="controls">
            <div class="select-row">
                <div class="custom-select" id="pairSelect">
                    <div class="select-btn" id="pairBtn" onclick="toggleDrop('pair')">
                        <span class="label" id="pairLabel">Select Pair ▼</span>
                        <span class="arr">▼</span>
                    </div>
                    <div class="select-drop" id="pairDrop"></div>
                </div>
                <div class="custom-select" id="timeSelect">
                    <div class="select-btn" id="timeBtn" onclick="toggleDrop('time')">
                        <span class="label" id="timeLabel">Select Time ▼</span>
                        <span class="arr">▼</span>
                    </div>
                    <div class="select-drop" id="timeDrop"></div>
                </div>
            </div>
            <button class="copy-btn" style="margin-top: 8px; font-size: 14px; padding: 14px; box-shadow: 0 0 20px rgba(245,158,11,0.3);" onclick="requestSignal()">
                <svg style="width:15px;height:15px;vertical-align:middle;margin-right:6px;fill:#09090b;" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                GET SIGNAL
            </button>
        </div>

        <div class="signal-wrap">
            <div class="signal-card">
                <div class="signal-top">
                    <div class="signal-icon" id="sigIcon">
                        <svg style="width:24px;height:24px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                    </div>
                    <div class="signal-info">
                        <div class="signal-pair" id="sigPair">Select pair & time</div>
                        <div class="signal-meta" id="sigMeta">Waiting for signal...</div>
                    </div>
                    <div class="signal-dir WAIT" id="sigDir">—</div>
                </div>
                <div class="countdown-wrap">
                    <div class="countdown-label">SIGNAL COUNTDOWN</div>
                    <div class="countdown-bar-bg">
                        <div class="countdown-bar" id="cntBar"></div>
                    </div>
                    <div class="countdown-num neutral" id="cntNum">--:--</div>
                </div>
            </div>
        </div>

        <div class="stats-row">
            <div class="stat-box">
                <div class="stat-val" id="statTotal">0</div>
                <div class="stat-lbl">TOTAL</div>
            </div>
            <div class="stat-box">
                <div class="stat-val" style="color:#00e676;" id="statUp">0</div>
                <div class="stat-lbl">CALL ↑</div>
            </div>
            <div class="stat-box">
                <div class="stat-val" style="color:#ff3d5a;" id="statDown">0</div>
                <div class="stat-lbl">PUT ↓</div>
            </div>
        </div>

        <div class="section-title">SIGNAL HISTORY</div>
        <div class="history-list" id="historyList">
            <div class="empty-state">
                <div class="icon">
                    <svg style="width:36px;height:36px;fill:var(--muted);" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 7.48 2 13c0 2.9 1.29 5.5 3.33 7.33L7 18.8c-1.57-1.45-2.5-3.56-2.5-5.8 0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.24-.93 4.35-2.5 5.8l1.67 1.53C20.71 18.5 22 15.9 22 13c0-5.52-4.48-10-10-10zm0 4c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l1.42-1.42C8.5 15.28 8 14.19 8 13c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.19-.5 2.28-1.34 3.06l1.42 1.42C17.33 16.16 18 14.66 18 13c0-3.31-2.69-6-6-6z"/></svg>
                </div>
                No signals yet. Select a pair & time.
            </div>
        </div>
    </div>

    <div id="toast"></div>

    <div class="popup-overlay" id="popupOverlay">
        <div class="popup">
            <div id="popupLoadingState">
                <div class="pending-spinner" style="margin-bottom: 12px;"></div>
                <div class="popup-title" style="letter-spacing: 2px;">ANALYZING MARKET...</div>
                <div class="popup-pair" id="popupPrepSeconds" style="color: var(--text); font-size: 26px; margin: 15px 0;">5s</div>
            </div>
            <div id="popupSignalState" style="display: none;">
                <div class="popup-icon" id="popIcon">
                    <svg style="width:32px;height:32px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
                </div>
                <div class="popup-title">NEW SIGNAL</div>
                <div class="popup-pair" id="popDir">UP</div>
                <div class="popup-body" style="font-weight:600;" id="popPairName">---</div>
                <div class="popup-body" id="popDur" style="color:var(--muted); font-size:12px; margin-top:-10px;">Duration: --</div>
                <button class="popup-btn" onclick="closePopupAndStartTrade()">GOT IT ✓</button>
            </div>
        </div>
    </div>

<script>
// Local Storage sync
localStorage.setItem('rqa_device_id', '${userId}');

const PAIRS = [ 
    "USD/PKR(OTC)","USD/ARS(OTC)","USD/CAD(OTC)","USD/DZD(OTC)","USD/NZD(OTC)", 
    "NZD/CAD(OTC)","USD/BDT(OTC)","USD/MXN(OTC)","USD/TRY(OTC)","NZD/JPY(OTC)", 
    "Solana(OTC)","Celestia(OTC)","TRON(OTC)","Trump(OTC)","Gold(OTC)","Silver(OTC)", 
    "UScrude(OTC)","UKBrent(OTC)","Johnson & Johnson(OTC)","Intel(OTC)", 
    "FACEBOOK INC(OTC)","Pfizer Inc(OTC)","Microsoft(OTC)","American Express(OTC)", 
    "Boeing Company(OTC)","McDonald's(OTC)","Pepe(OTC)" 
]; 

const TIMES = [ 
    {l:"5 Sec",v:5},{l:"10 Sec",v:10},{l:"15 Sec",v:15},{l:"30 Sec",v:30}, 
    {l:"1 Min",v:60},{l:"2 Min",v:120},{l:"5 Min",v:300},{l:"10 Min",v:600} 
]; 

function buildDrops() { 
    const pd = document.getElementById('pairDrop'); 
    if(!pd) return;
    pd.innerHTML = "";
    PAIRS.forEach(p => { 
        const d = document.createElement('div'); 
        d.className = 'drop-item'; 
        d.textContent = p; 
        d.onclick = () => selectPair(p); 
        pd.appendChild(d); 
    }); 
    const td = document.getElementById('timeDrop'); 
    if(!td) return;
    td.innerHTML = "";
    TIMES.forEach(t => { 
        const d = document.createElement('div'); 
        d.className = 'drop-item'; 
        d.textContent = t.l; 
        d.onclick = () => selectTime(t); 
        td.appendChild(d); 
    }); 
} 

function toggleDrop(type) { 
    const pd = document.getElementById('pairDrop'), pb = document.getElementById('pairBtn'); 
    const td = document.getElementById('timeDrop'), tb = document.getElementById('timeBtn'); 
    if (type === 'pair') { 
        const o = pd.classList.contains('show'); 
        pd.classList.toggle('show', !o); 
        pb.classList.toggle('open', !o); 
        td.classList.remove('show'); 
        tb.classList.remove('open'); 
    } else { 
        const o = td.classList.contains('show'); 
        td.classList.toggle('show', !o); 
        tb.classList.toggle('open', !o); 
        pd.classList.remove('show'); 
        pb.classList.remove('open'); 
    } 
} 

document.addEventListener('click', e => { 
    if (!e.target.closest('#pairSelect')) { 
        const pd = document.getElementById('pairDrop'), pb = document.getElementById('pairBtn');
        if(pd && pb){ pd.classList.remove('show'); pb.classList.remove('open'); }
    } 
    if (!e.target.closest('#timeSelect')) { 
        const td = document.getElementById('timeDrop'), tb = document.getElementById('timeBtn');
        if(td && tb){ td.classList.remove('show'); tb.classList.remove('open'); }
    } 
}); 

let selPair = null, selTime = null; 
function selectPair(p) { 
    selPair = p; 
    document.getElementById('pairLabel').textContent = p; 
    document.getElementById('pairDrop').classList.remove('show'); 
    document.getElementById('pairBtn').classList.remove('open'); 
    document.querySelectorAll('#pairDrop .drop-item').forEach(d => d.classList.toggle('active', d.textContent === p)); 
    setNoSignal();
} 

function selectTime(t) { 
    selTime = t; 
    document.getElementById('timeLabel').textContent = t.l; 
    document.getElementById('timeDrop').classList.remove('show'); 
    document.getElementById('timeBtn').classList.remove('open'); 
    document.querySelectorAll('#timeDrop .drop-item').forEach(d => d.classList.toggle('active', d.textContent === t.l)); 
    setNoSignal();
} 

let statsUp = 0, statsDown = 0; 
let signalHistory = []; 
let countdownInterval = null; 
let prepInterval = null;
let generatedActiveSignal = null;

function requestSignal() {
    if (!selPair || !selTime) {
        showToast("❌ Pair aur Time select karein!");
        return;
    }
    if (countdownInterval) clearInterval(countdownInterval);
    if (prepInterval) clearInterval(prepInterval);

    document.getElementById('popupOverlay').classList.add('show');
    document.getElementById('popupLoadingState').style.display = 'block';
    document.getElementById('popupSignalState').style.display = 'none';

    let secondsLeft = 5;
    document.getElementById('popupPrepSeconds').textContent = secondsLeft + 's';

    prepInterval = setInterval(() => {
        secondsLeft--;
        document.getElementById('popupPrepSeconds').textContent = secondsLeft + 's';
        if (secondsLeft <= 0) {
            clearInterval(prepInterval);
            processSignalGeneration();
        }
    }, 1000);
}

function processSignalGeneration() {
    const randomDirection = Math.random() < 0.5 ? 'UP' : 'DOWN';
    const signalTypes = ["ALGO V4", "SCALPING M1", "BREAKOUT PRO", "CHINESE QUANT"];
    const selectedType = signalTypes[Math.floor(Math.random() * signalTypes.length)];

    generatedActiveSignal = {
        dir: randomDirection,
        duration: selTime.v,
        type: selectedType,
        pair: selPair,
        tl: selTime.l
    };

    const popIconEl = document.getElementById('popIcon');
    if (randomDirection === 'UP') {
        popIconEl.innerHTML = '<svg style="width:32px;height:32px;fill:var(--up);" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>';
    } else {
        popIconEl.innerHTML = '<svg style="width:32px;height:32px;fill:var(--down);" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>';
    }
    
    document.getElementById('popDir').textContent = randomDirection === 'UP' ? '↑ CALL' : '↓ PUT'; 
    document.getElementById('popDir').className = 'popup-pair ' + randomDirection; 
    document.getElementById('popPairName').textContent = generatedActiveSignal.pair; 
    document.getElementById('popDur').textContent = 'Duration: ' + generatedActiveSignal.tl; 

    document.getElementById('popupLoadingState').style.display = 'none';
    document.getElementById('popupSignalState').style.display = 'block';
}

function closePopupAndStartTrade() { 
    document.getElementById('popupOverlay').classList.remove('show'); 
    if (generatedActiveSignal) {
        if (generatedActiveSignal.dir === 'UP') statsUp++; else statsDown++; 
        updateStats();
        addHistory(generatedActiveSignal);
        showToast('🔔 ' + generatedActiveSignal.pair + ' — ' + (generatedActiveSignal.dir === 'UP' ? '↑ CALL' : '↓ PUT'));

        updateCard(generatedActiveSignal);
        runCountdown(generatedActiveSignal.duration, generatedActiveSignal.duration, generatedActiveSignal.dir);
    }
} 

function setNoSignal() { 
    document.getElementById('sigPair').textContent = selPair || 'Select pair & time'; 
    document.getElementById('sigMeta').textContent = 'Waiting for signal...'; 
    document.getElementById('sigDir').textContent = '—'; 
    document.getElementById('sigDir').className = 'signal-dir WAIT'; 
    
    const sigIconEl = document.getElementById('sigIcon');
    if(sigIconEl) {
        sigIconEl.innerHTML = '<svg style="width:24px;height:24px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>';
        sigIconEl.className = 'signal-icon'; 
    }

    document.getElementById('cntNum').textContent = '--:--'; 
    document.getElementById('cntNum').className = 'countdown-num neutral'; 
    document.getElementById('cntBar').style.width = '0%'; 
    document.getElementById('cntBar').className = 'countdown-bar'; 
    if (countdownInterval) clearInterval(countdownInterval); 
} 

function updateCard(sig) { 
    document.getElementById('sigPair').textContent = sig.pair; 
    document.getElementById('sigMeta').textContent = sig.tl + ' • ' + sig.type; 
    const de = document.getElementById('sigDir'); 
    de.textContent = sig.dir === 'UP' ? '↑ CALL' : '↓ PUT'; 
    de.className = 'signal-dir ' + sig.dir; 
    
    const ie = document.getElementById('sigIcon'); 
    if (sig.dir === 'UP') {
        ie.innerHTML = '<svg style="width:24px;height:24px;fill:var(--up);" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>';
        ie.className = 'signal-icon up-icon';
    } else {
        ie.innerHTML = '<svg style="width:24px;height:24px;fill:var(--down);" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>';
        ie.className = 'signal-icon down-icon';
    }
} 

function runCountdown(remaining, total, dir) {
    let cdRemaining = remaining;
    const cntNum = document.getElementById('cntNum');
    const cntBar = document.getElementById('cntBar');

    function renderCD() {
        const pct = Math.max(0, (cdRemaining / total) * 100);
        const m = Math.floor(cdRemaining / 60);
        const s = Math.floor(cdRemaining % 60);
        cntNum.textContent = m > 0 ? m + ':' + String(s).padStart(2,'0') : s + 's';
        cntNum.className = 'countdown-num ' + (dir === 'UP' ? 'up' : 'down');
        cntBar.style.width = pct + '%';
        cntBar.className = 'countdown-bar ' + (dir === 'UP' ? 'up' : 'down');
    }

    renderCD();
    countdownInterval = setInterval(() => {
        cdRemaining -= 1;
        if (cdRemaining <= 0) {
            cdRemaining = 0;
            clearInterval(countdownInterval);
            setNoSignal();
        }
        renderCD();
    }, 1000);
}

function addHistory(sig) { 
    signalHistory.unshift({ ...sig, at: Date.now() }); 
    if (signalHistory.length > 20) signalHistory.pop(); 
    renderHistory(); 
} 

function renderHistory() { 
    const list = document.getElementById('historyList'); 
    if (!list) return;
    if (!signalHistory.length) { 
        list.innerHTML = \`<div class="empty-state"><div class="icon"><svg style="width:36px;height:36px;fill:var(--muted);" viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 7.48 2 13c0 2.9 1.29 5.5 3.33 7.33L7 18.8c-1.57-1.45-2.5-3.56-2.5-5.8 0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.24-.93 4.35-2.5 5.8l1.67 1.53C20.71 18.5 22 15.9 22 13c0-5.52-4.48-10-10-10zm0 4c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l1.42-1.42C8.5 15.28 8 14.19 8 13c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.19-.5 2.28-1.34 3.06l1.42 1.42C17.33 16.16 18 14.66 18 13c0-3.31-2.69-6-6-6z"/></svg></div>No signals yet.</div>\`; 
        return; 
    } 
    list.innerHTML = ''; 
    signalHistory.forEach(s => { 
        const t = new Date(s.at); 
        const ts = t.getHours().toString().padStart(2,'0')+':'+t.getMinutes().toString().padStart(2,'0')+':'+t.getSeconds().toString().padStart(2,'0'); 
        const el = document.createElement('div'); 
        el.className = 'hist-item'; 
        el.innerHTML = \` 
            <div class="hist-dir \${s.dir}">\${s.dir==='UP'?'↑ CALL':'↓ PUT'}</div> 
            <div class="hist-info"><div class="hist-pair">\${s.pair}</div><div class="hist-time">\${ts} • \${s.type}</div></div> 
            <div class="hist-dur">\${s.tl}</div>\`; 
        list.appendChild(el); 
    }); 
} 

function updateStats() { 
    const st = document.getElementById('statTotal');
    if(st) st.textContent = statsUp + statsDown; 
    const su = document.getElementById('statUp');
    if(su) su.textContent = statsUp; 
    const sd = document.getElementById('statDown');
    if(sd) sd.textContent = statsDown; 
} 

let toastTimer; 
function showToast(msg) { 
    const t = document.getElementById('toast'); 
    if(!t) return;
    t.textContent = msg; 
    t.classList.add('show'); 
    clearTimeout(toastTimer); 
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000); 
} 

function initApp() { 
    buildDrops(); 
    updateStats(); 
    renderHistory(); 
} 

initApp();
</script>
</body>
</html>`;
}
