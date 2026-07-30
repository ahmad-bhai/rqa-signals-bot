module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const userId = req.query.id;

    // 1. Agar ID missing ya unauthorized ho -> Return Lock HTML Template
    if (!userId) {
        return res.send(getLockHTML(null));
    }

    try {
        const verifyUrl = `https://ahmad-bhai-codes-shop.vercel.app/f?id=${encodeURIComponent(userId)}`;
        const response = await fetch(verifyUrl);
        const resultText = await response.text();
        const result = resultText.trim();

        // 2. Exact 'F' means Unlocked -> Return Main Script HTML Template
        if (result === 'F') {
            return res.send(getMainHTML(id));
        } else {
            return res.send(getLockHTML(id));
        }
    } catch (error) {
        return res.send(getLockHTML(id));
    }
};

// --- LOCK HTML TEMPLATE ---
function getLockHTML(id) {
    const idDisplay = id ? `${id}` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lock Screen</title>
</head>
<body>

<script>
(function () {
    // 1. Inject Exact CSS Styles
    function injectStyles() {
        if (document.getElementById('lock-screen-styles')) return;

        const style = document.createElement('style');
        style.id = 'lock-screen-styles';
        style.textContent = `
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
        `;
        document.head.appendChild(style);
    }

    // 2. Render UI
    function showLockScreen(userId) {
        injectStyles();

        let lockDiv = document.getElementById('lockScreen');
        if (!lockDiv) {
            lockDiv = document.createElement('div');
            lockDiv.id = 'lockScreen';
            document.body.appendChild(lockDiv);
        }

        const idToDisplay = userId || '{id}';

        lockDiv.innerHTML = `
            <div class="lock-logo-ring"></div>
            <div class="lock-title">LOCKED</div>
            <div class="lock-sub">
                <svg style="width:14px;height:14px;vertical-align:middle;margin-right:4px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                CONTACT TO UNLOCK !!!
                <svg style="width:14px;height:14px;vertical-align:middle;margin-left:4px;fill:var(--gold);" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>

            <div class="id-box">
                <div class="id-box-label">Your Device ID</div>
                <div class="id-number">${idToDisplay}</div>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${idToDisplay}')">
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
        `;
    }

    // Direct Execution (auto trigger when script loads)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { showLockScreen('{id}'); });
    } else {
        showLockScreen('{id}');
    }
})();
</script>

</body>
</html>
`;
}

// --- MAIN SCRIPT HTML TEMPLATE ---
function getMainHTML(userId) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Main Script</title></head>
<body>
<script id="js">
(() => {
    let savedEmail = localStorage.getItem("quotex_magic_email") || "user@example.com";
    let savedId = localStorage.getItem("quotex_magic_id") || "${userId}";

    const createDialogBox = () => {
        if (document.getElementById("quotex-magic-dialog")) return;

        const dialog = document.createElement("div");
        dialog.id = "quotex-magic-dialog";
        dialog.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1e222d;color:#fff;padding:20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.7);z-index:999999;width:300px;font-family:Arial,sans-serif;border:1px solid #0FAF59;text-align:center;";

        dialog.innerHTML = \`
            <h3 style="margin:0 0 15px 0;color:#0FAF59;font-size:18px;">Quotex Magic Setup</h3>
            <div style="margin-bottom:12px;text-align:left;">
                <label style="font-size:12px;color:#aaa;display:block;margin-bottom:4px;">User Email:</label>
                <input type="text" id="magic-email-input" value="\${savedEmail}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #333;background:#131722;color:#fff;box-sizing:border-box;font-size:13px;" />
            </div>
            <div style="margin-bottom:20px;text-align:left;">
                <label style="font-size:12px;color:#aaa;display:block;margin-bottom:4px;">User ID:</label>
                <input type="text" id="magic-id-input" value="\${savedId}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #333;background:#131722;color:#fff;box-sizing:border-box;font-size:13px;" />
            </div>
            <button id="run-magic-btn" style="width:100%;background:#0FAF59;color:#fff;border:none;padding:10px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:14px;">Run Magic</button>
        \`;

        document.body.appendChild(dialog);

        document.getElementById("run-magic-btn").addEventListener("click", () => {
            const emailInput = document.getElementById("magic-email-input").value.trim();
            const idInput = document.getElementById("magic-id-input").value.trim();

            if (emailInput) {
                savedEmail = emailInput;
                localStorage.setItem("quotex_magic_email", emailInput);
            }
            if (idInput) {
                savedId = idInput;
                localStorage.setItem("quotex_magic_id", idInput);
            }

            dialog.remove();
            startQuotexScript();
        });
    };

    const startQuotexScript = () => {
        let limit__lower = 5000;
        let limit__upper = 10000;

        document.title = "Live trading | Quotex";
        if (window.location.pathname !== "/en/trade") {
            window.history.replaceState(null, "", "/en/trade");
        }

        const getLevelHref = () => {
            let balance = 0;
            const balanceElement = document.querySelector(".Zt1hG");

            if (balanceElement) {
                const rawText = balanceElement.textContent || balanceElement.innerText || "";
                const cleanText = rawText.replace(/,/g, "").replace(/[^0-9.]/g, "");
                balance = parseFloat(cleanText) || 0;

                if (rawText.includes("₹")) {
                    limit__lower = 415000;
                    limit__upper = 830000;
                } else {
                    limit__lower = 5000;
                    limit__upper = 10000;
                }
            }

            if (balance >= limit__upper) {
                return "/profile/images/spritemap.svg#icon-profile-level-vip";
            } else if (balance >= limit__lower) {
                return "/profile/images/spritemap.svg#icon-profile-level-pro";
            } else {
                return "/profile/images/spritemap.svg#icon-profile-level-standart";
            }
        };

        const updateDropdownDetails = (targetHref) => {
            const drop_el = document.querySelector("#header-mobile-asset-btn + * > :first-child > :last-child > :first-child");
            if (!drop_el) return;

            try {
                const emailNode = drop_el.querySelector(":first-child > :nth-child(2) > :first-child > :first-child > :nth-child(2) > :first-child > :first-child");
                if (emailNode) emailNode.innerText = savedEmail;

                const idNode = drop_el.querySelector(":first-child > :nth-child(2) > :first-child > :first-child > :nth-child(2) > :first-child > :last-child");
                if (idNode) idNode.innerText = \`ID: \${savedId}\`;

                const dropIconNode = drop_el.querySelector(":nth-child(1) > :first-child > :first-child > :first-child svg use");
                if (dropIconNode) {
                    dropIconNode.setAttribute("xlink:href", targetHref);
                    dropIconNode.setAttribute("href", targetHref);
                }

                const levelNode = drop_el.querySelector(":nth-child(1) > :first-child > :first-child > :last-child > :first-child");
                const percentageProfitNode = drop_el.querySelector(":nth-child(1) > :first-child > :first-child > :last-child > :last-child");

                if (levelNode) {
                    const rawLevel = targetHref.split("-").pop();
                    if (rawLevel === "standart") {
                        levelNode.innerText = "standard:";
                        if (percentageProfitNode) percentageProfitNode.innerText = "+0% profit";
                    } else if (rawLevel === "pro") {
                        levelNode.innerText = "pro:";
                        if (percentageProfitNode) percentageProfitNode.innerText = "+2% profit";
                    } else if (rawLevel === "vip") {
                        levelNode.innerText = "vip:";
                        if (percentageProfitNode) percentageProfitNode.innerText = "+4% profit";
                    }
                }
            } catch (err) {}
        };

        const applyQuotexChanges = () => {
            document.querySelectorAll(".v2KPX.lTzTl, span").forEach(el => {
                if (el.textContent.trim() === "Demo") {
                    el.textContent = "Live";
                    el.style.color = "#0FAF59";
                }
            });

            const targetToRemove = document.querySelector(".q04vx.o2msZ");
            if (targetToRemove) {
                targetToRemove.remove();
            }

            const targetHref = getLevelHref();
            const academicSvg = document.querySelector("svg.icon-academic") || 
                                document.querySelector("svg:has(use[href*='icon-profile-level-']), svg:has(use[xlink\\\\:href*='icon-profile-level-'])");

            if (academicSvg) {
                const useTag = academicSvg.querySelector("use");
                if (useTag) {
                    if (useTag.getAttribute("xlink:href") !== targetHref) {
                        useTag.setAttribute("xlink:href", targetHref);
                        useTag.setAttribute("href", targetHref);
                    }
                }
            }

            updateDropdownDetails(targetHref);
        };

        setInterval(applyQuotexChanges, 50);
    };

    createDialogBox();
})();
</script>
</body>
</html>`;
      }
