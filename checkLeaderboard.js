import axios from 'axios';
import https from 'https';

// Constants (your actual values are already included)
const TITLE_ID = '168AE2';
const SECRET_KEY = 'IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'vpntou3r4epvniqqgccoe2bxe';

const leaderboardStatistic = 'PiPuzzle_LevelsCompleted';
const lastKnownRanks = new Map();

async function getLeaderboard() {
    const url = `https://${TITLE_ID}.playfabapi.com/Server/GetLeaderboard`;

    const response = await axios.post(
        url,
        {
            StatisticName: leaderboardStatistic,
            StartPosition: 0,
            MaxResultsCount: 10
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-SecretKey': SECRET_KEY
            }
        }
    );

    return response.data.data.Leaderboard;
}

async function sendNotification(oneSignalId, message) {
    const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [oneSignalId],
        headings: { en: "Leaderboard Alert" },
        contents: { en: message }
    };

    await axios.post('https://onesignal.com/api/v1/notifications', payload, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${ONESIGNAL_API_KEY}`
        }
    });
}

async function getUserData(playFabId) {
    const url = `https://${TITLE_ID}.playfabapi.com/Server/GetUserData`;

    const response = await axios.post(
        url,
        {
            PlayFabId: playFabId,
            Keys: ["OneSignalPlayerId"]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-SecretKey': SECRET_KEY
            }
        }
    );

    return response.data.data.Data?.OneSignalPlayerId?.Value;
}

async function monitorLeaderboard() {
    try {
        const leaderboard = await getLeaderboard();

        leaderboard.forEach(async (entry, index) => {
            const previousRank = lastKnownRanks.get(entry.PlayFabId);
            const currentRank = index + 1;

            if (previousRank && currentRank > previousRank) {
                const oneSignalId = await getUserData(entry.PlayFabId);
                if (oneSignalId) {
                    await sendNotification(oneSignalId, `You dropped from rank ${previousRank} to ${currentRank}.`);
                }
            }

            lastKnownRanks.set(entry.PlayFabId, currentRank);
        });

        console.log("✅ Leaderboard check complete.");
    } catch (err) {
        console.error("❌ Error checking leaderboard:", err.message);
    }
}

monitorLeaderboard();
