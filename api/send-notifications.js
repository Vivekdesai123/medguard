const MEDICINES = [
  { name: "Metformin", dose: "500mg", times: ["08:00", "20:00"] },
  { name: "Amlodipine", dose: "5mg", times: ["09:00"] },
  { name: "Atorvastatin", dose: "10mg", times: ["21:00"] },
  { name: "Vitamin D3", dose: "1000IU", times: ["10:00"] },
];

async function getAccessToken(serviceAccount) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const base64url = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const signingInput = `${base64url(header)}.${base64url(payload)}`;

  const crypto = require("crypto");
  const privateKey = serviceAccount.private_key;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign
    .sign(privateKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function sendFCMNotification(accessToken, projectId, fcmToken, title, body) {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: { title, body },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              priority: "max",
              visibility: "public",
              default_vibrate_timings: true,
            },
          },
          webpush: {
            headers: { Urgency: "high" },
            notification: {
              title,
              body,
              icon: "/logo192.png",
              badge: "/logo192.png",
              requireInteraction: true,
              vibrate: [300, 100, 300],
              actions: [
                { action: "taken", title: "✅ Taken" },
                { action: "skip", title: "❌ Skip" },
              ],
            },
            fcm_options: { link: "https://medguard-fawn.vercel.app" },
          },
        },
      }),
    }
  );
  return res.json();
}

export default async function handler(req, res) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: "medguard-b6257",
      private_key_id: "c7fb283378",
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      token_uri: "https://oauth2.googleapis.com/token",
    };

    const fcmToken = process.env.FCM_TOKEN;

    if (!fcmToken) {
      return res.json({ success: false, error: "No FCM token registered yet" });
    }

    if (!serviceAccount.private_key || !serviceAccount.client_email) {
      return res.json({ success: false, error: "Missing Firebase credentials" });
    }

    // Get current time in India
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const currentHour = String(now.getHours()).padStart(2, "0");
    const currentMin = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${currentHour}:${currentMin}`;

    // Find medicines due right now
    const dueMeds = [];
    MEDICINES.forEach((med) => {
      med.times.forEach((t) => {
        if (t === currentTime) {
          dueMeds.push(med);
        }
      });
    });

    if (dueMeds.length === 0) {
      return res.json({
        success: true,
        message: `No medicines due at ${currentTime}`,
        time: currentTime,
      });
    }

    // Get Firebase access token
    const accessToken = await getAccessToken(serviceAccount);

    // Send notification for each due medicine
    const results = [];
    for (const med of dueMeds) {
      const result = await sendFCMNotification(
        accessToken,
        "medguard-b6257",
        fcmToken,
        "💊 Medicine Time",
        `Take ${med.name} ${med.dose} now`
      );
      results.push({ med: med.name, result });
    }

    return res.json({
      success: true,
      time: currentTime,
      sent: dueMeds.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
