const axios = require('axios');

const PLAYFAB_TITLE_ID = '168AE2';
const STATISTIC_NAME = 'PiPuzzle_LevelsCompleted';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'vpntou3r4epvniqqgccoe2bxe';

async function fetchLeaderboard() {
    const response = await axios.post(`https://${PLAYFAB_TITLE_ID}.playfabapi.com/Client/GetLeaderboard`, {
        StatisticName: STATISTIC_NAME,
        StartPosition: 0,
        MaxResultsCount: 10
    }, {
        headers: {
            'X-SecretKey': 'YOUR_PLAYFAB_SECRET_KEY',
            'Content-Type': 'application/json'
        }
    });

    return response.data.data.Leaderboard;
}

async function sendNotification(playerId, message) {
    await axios.post('https://onesignal.com/api/v1/notifications', {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [playerId],
        contents: { en: message }
    }, {
        headers: {
            'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
}

(async () => {
    const leaderboard = await fetchLeaderboard();
    console.log('Top 10:', leaderboard);
    // 💡 Add logic here to compare with previous and detect drops
})();
