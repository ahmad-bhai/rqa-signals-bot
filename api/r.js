export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight OPTIONS request
    if (req.method === 'OPTIONS') {  
        return res.status(200).end();  
    }  

    try {  
        // 1. URL se ID read karna
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);  
        let incomingId = searchParams.get('id');  

        if (!incomingId) {  
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).send("No ID Provided");  
        }  

        incomingId = String(incomingId).trim();

        // 2. Real-Time Device & Client Metadata Tracking
        const userAgent = req.headers['user-agent'] || 'Unknown Device';
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'Unknown IP';
        const language = req.headers['accept-language']?.split(',')[0] || 'Unknown';

        // Simple User-Agent Parsing (Quotex / Platform Style Browser & OS Detection)
        let os = "Unknown OS";
        if (userAgent.includes("Windows")) os = "Windows PC";
        else if (userAgent.includes("Macintosh")) os = "macOS";
        else if (userAgent.includes("Android")) os = "Android Mobile";
        else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS Device";
        else if (userAgent.includes("Linux")) os = "Linux";

        let browser = "Unknown Browser";
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Google Chrome";
        else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Apple Safari";
        else if (userAgent.includes("Firefox")) browser = "Mozilla Firefox";
        else if (userAgent.includes("Edg")) browser = "Microsoft Edge";

        const now = new Date();
        const currentLog = {
            timestamp: now.toISOString(),
            date: now.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi' }),
            time: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' }),
            ip: clientIp,
            device: `${os} | ${browser}`,
            userAgent: userAgent,
            language: language,
            requestUrl: req.url
        };

        // 3. New Firebase Realtime Database Endpoint
        const dbURL = `https://rqa-bot-admin-default-rtdb.firebaseio.com/users.json`;  
        const response = await fetch(dbURL);  
          
        if (!response.ok) {  
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).send(incomingId);  
        }  

        const allUsers = await response.json();  
        let userKey = null;
        let userData = null;

        if (allUsers) {  
            for (let key in allUsers) {  
                if (allUsers[key] && String(allUsers[key].id) === incomingId) {  
                    userKey = key;
                    userData = allUsers[key];
                    break;  
                }  
            }  
        }  

        // Check user active/unlocked status
        const isUnlocked = userData && userData.status === "active";

        // 4. Log Update Mechanism (Keep Last 5 Logs)
        if (userKey) {
            currentLog.status = isUnlocked ? "Unlocked (Active)" : "Locked (Inactive)";

            let existingLogs = userData.logs || [];
            // Safe array handling
            if (!Array.isArray(existingLogs)) {
                existingLogs = [];
            }

            // Latest log ko top par rakhein aur max 5 slots maintain karein
            existingLogs.unshift(currentLog);
            const updatedLogs = existingLogs.slice(0, 5);

            // Firebase mein latest log write back karna
            await fetch(`https://rqa-bot-admin-default-rtdb.firebaseio.com/users/${userKey}/logs.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedLogs)
            });
        }

        // 5. Response Routing
        res.setHeader('Content-Type', 'text/plain');

        if (isUnlocked) {  
            // Agar Unlocked/Active hai toh R return karega
            return res.status(200).send("R");  
        } else {  
            // Agar Lock / Inactive / Non-existent hai toh wahi ID output hogi
            return res.status(200).send(incomingId);  
        }  

    } catch (error) {  
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(req.query?.id || "Error");  
    }
}
