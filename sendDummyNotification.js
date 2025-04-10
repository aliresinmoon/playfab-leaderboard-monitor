import axios from "axios";

// Debug: Output your env vars to GitHub logs
console.log("🔍 OneSignal App ID:", process.env.ONESIGNAL_APP_ID);
console.log("🔍 OneSignal API Key (starts with):", process.env.ONESIGNAL_API_KEY?.substring(0, 5) + "...");

// Read env vars
const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;

// Validate env vars
if (!appId || !apiKey) {
  console.error("❌ Missing OneSignal App ID or API Key.");
  process.exit(1);
}

// Build the push message
const message = {
  app_id: appId,
  included_segments: ["All"],
  headings: { en: "🔥 Dummy Notification" },
  contents: { en: "🚀 This is a test from GitHub Actions!" }
};

// Send to OneSignal
axios.post("https://onesignal.com/api/v1/notifications", message, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${apiKey}`
  }
})
.then(response => {
  console.log("✅ Notification sent successfully:");
  console.log(response.data);
})
.catch(error => {
  console.error("❌ Failed to send notification:");
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
  } else {
    console.error("Error:", error.message);
  }
  process.exit(1);
});
