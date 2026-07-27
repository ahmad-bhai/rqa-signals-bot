export default async function handler(req, res) {
    // 1. Full CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight OPTIONS Request Handle karna
    if (req.method === 'OPTIONS') {  
        return res.status(200).end();  
    }  

    // Output strictly Text format rakhne ke liye default header
    res.setHeader('Content-Type', 'text/plain');

    try {  
        // 2. Query Parameter Se ID Read Karna (?id=...)
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);  
        let incomingId = searchParams.get('id');  

        if (!incomingId) {  
            return res.status(200).send("No ID Provided");  
        }  

        incomingId = String(incomingId).trim();

        // 3. Complete Device, IP & Browser Tracking
        const userAgent = req.headers['user-agent'] || 'Unknown Device';
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'Unknown IP';
        const language = req.headers['accept-language']?.split(',')[0] || 'Unknown';

        // Platform & Browser Identification
        let os = "Unknown OS";
        if (userAgent.includes("Windows")) os = "Windows PC";
        else if (userAgent.includes("Macintosh")) os = "macOS";
        else if (userAgent.includes("Android")) os = "Android Mobile";
        else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
        else if (userAgent.includes("Linux")) os = "Linux";

        let browser = "Unknown Browser";
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Chrome";
        else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
        else if (userAgent.includes("Firefox")) browser = "Firefox";
        else if (userAgent.includes("Edg")) browser = "Edge";

        const now = new Date();
        const newLogEntry = {
            timestamp: now.toISOString(),
            date: now.toLocaleDateString('en-US', { timeZone: 'Asia/Karachi' }),
            time: now.toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' }),
            ip: clientIp,
            device: `${os} | ${browser}`,
            userAgent: userAgent,
            language: language
        };

        // 4. Firebase Realtime DB URL
        const firebaseBaseURL = "https://rqa-bot-admin-default-rtdb.firebaseio.com";
        const getUsersUrl = `${firebaseBaseURL}/users.json`;

        // Firebase se poora users collection fetch karein
        const fetchResponse = await fetch(getUsersUrl);  
          
        if (!fetchResponse.ok) {  
            // Connection error ki wajah se wahi ID waapas show karega
            return res.status(200).send(incomingId);  
        }  

        const allUsers = await fetchResponse.json();  
        let foundUserKey = null;
        let foundUserData = null;

        if (allUsers) {  
            for (let key in allUsers) {  
                if (allUsers[key] && String(allUsers[key].id).trim() === incomingId) {  
                    foundUserKey = key;
                    foundUserData = allUsers[key];
                    break;  
                }  
            }  
        }  

        // Active status verification
        const isUnlocked = foundUserData && foundUserData.status === "active";

        // 5. DATA SAVE IN FIREBASE (5-Log Array Maintenance)
        if (foundUserKey) {
            newLogEntry.status = isUnlocked ? "Unlocked (Active)" : "Locked (Inactive)";

            let existingLogs = foundUserData.logs;
            if (!Array.isArray(existingLogs)) {
                existingLogs = [];
            }

            // Latest log top par rakhein aur total 5 maintain karein
            existingLogs.unshift(newLogEntry);
            const last5Logs = existingLogs.slice(0, 5);

            // Firebase RTDB mein logs directly Save / Update karna
            const updateLogsUrl = `${firebaseBaseURL}/users/${foundUserKey}/logs.json`;
            
            await fetch(updateLogsUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(last5Logs)
            });
        }

        // 6. Response Handling
        if (isUnlocked) {  
            // Unlock ho toh R
            return res.status(200).send("R");  
        } else {  
            // Unlock Na ho toh Wahi ID
            return res.status(200).send(incomingId);  
        }  

    } catch (error) {  
        return res.status(200).send(req.query?.id || "Error");  
    }
}
