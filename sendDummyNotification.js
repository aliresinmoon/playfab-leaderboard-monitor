import axios from 'axios';

const ONE_SIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONE_SIGNAL_API_KEY = 'vpntou3r4epvniqqgccoe2bxe';

// Use a real Player ID from your PlayFab data
const playerId = 'YOUR_ONESIGNAL_PLAYER_ID';

const notification = {
  app_id: ONE_SIGNAL_APP_ID,
  include_player_ids: [playerId],
  headings: { en: '🚀 Test Notification' },
  contents: { en: 'You just received a dummy notification from GitHub Actions!' }
};

try {
  const response = await axios.post('https://onesignal.com/api/v1/notifications', notification, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${ONE_SIGNAL_API_KEY}`
    }
  });

  console.log('✅ Notification sent:', response.data);
} catch (error) {
  console.error('❌ Failed to send notification:', error.response?.data || error.message);
}
