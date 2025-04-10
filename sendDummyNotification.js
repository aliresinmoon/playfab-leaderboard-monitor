import axios from 'axios';

const message = {
  app_id: '3ee530aa-8613-485b-9cbd-0263727badc5',
  included_segments: ['Subscribed Users'],
  contents: { en: '📢 This is a test notification to ALL users.' },
  headings: { en: 'Global Test' }
};

axios.post('https://onesignal.com/api/v1/notifications', message, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic vpntou3r4epvniqqgccoe2bxe'
  }
})
.then(response => {
  console.log('✅ Notification sent:', response.data);
})
.catch(error => {
  console.error('❌ Error sending notification:', error.response?.data || error.message);
});
