import axios from 'axios';

const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'vpntou3r4epvniqqgccoe2bxe';
const ONE_SIGNAL_PLAYER_ID = 'YOUR_ONESIGNAL_PLAYER_ID'; // Replace this!

async function sendDummyNotification() {
  const notification = {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [ONE_SIGNAL_PLAYER_ID],
    headings: { en: "🔥 Test Notification" },
    contents: { en: "This is a dummy push notification from GitHub Actions!" }
  };

  try {
    const response = await axios.post("https://onesignal.com/api/v1/notifications", notification, {
      headers: {
        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Dummy notification sent:", response.data);
  } catch (error) {
    console.error("❌ Failed to send dummy notification:", error.response?.data || error.message);
  }
}

sendDummyNotification();
