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
            return res.send(getMainHTML(userId));
        } else {
            return res.send(getLockHTML(userId));
        }
    } catch (error) {
        return res.send(getLockHTML(userId));
    }
};

// --- LOCK HTML TEMPLATE ---
function getLockHTML(userId) {
    const idDisplay = userId ? `ID: ${userId}` : '';
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Locked</title></head>
<body>
<script id="js">
(() => {
    const oldLock = document.getElementById("quotex-lock-overlay");
    if (oldLock) oldLock.remove();

    const lockDiv = document.createElement("div");
    lockDiv.id = "quotex-lock-overlay";
    lockDiv.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0e1118;color:#fff;z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;";
    
    lockDiv.innerHTML = \`
        <div style="background:#1e222d;padding:25px;border-radius:14px;text-align:center;width:310px;border:1px solid #ff4d4d;box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <div style="font-size:40px;margin-bottom:10px;">🔒</div>
            <h2 style="color:#ff4d4d;margin:0 0 10px 0;font-size:20px;">Script Locked</h2>
            ${idDisplay ? `<div style="background:#131722;padding:8px;border-radius:6px;margin-bottom:12px;font-family:monospace;color:#0FAF59;word-break:break-all;">${idDisplay}</div>` : ''}
            <p style="color:#aaa;font-size:13px;line-height:1.5;margin-bottom:15px;">Contact to unlock access:<br><b style="color:#fff;">@Magic_Scripts</b></p>
            <a href="https://t.me/Magic_Scripts" target="_blank" style="display:inline-block;width:100%;background:#0FAF59;color:#fff;padding:10px 0;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;box-sizing:border-box;">Contact on Telegram</a>
        </div>
    \`;
    document.body.appendChild(lockDiv);
})();
</script>
</body>
</html>`;
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
