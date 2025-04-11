import axios from 'axios';

// ✅ CONFIGURATION
const PLAYFAB_TITLE_ID = '168AE2';
const PLAYFAB_SECRET_KEY = 'IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM';
const STATISTIC_NAME = 'PiPuzzle_LevelsCompleted';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'os_v2_app_h3stbkugcnefxhf5ajrxe65nyxwsit5mlbgudcn7e26hpn2lwdp7wmpcujs7p4mhjwiip63ils24iez2qln5ztvx6xy4cntvhmrd4xi';

let previousRanks = {};

async function getLeaderboard() {
  try {
    const response = await axios.post(
      `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetLeaderboard`,
      {
        StatisticName: STATISTIC_NAME,
        MaxResultsCount: 100 // Support up to 100 players
      },
      {
        headers: {
          'X-SecretKey': PLAYFAB_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    const leaderboard = response.data.data.Leaderboard;
    console.log(`📊 Leaderboard fetched: ${leaderboard.length} players`);
    return leaderboard;
  } catch (error) {
    console.error("❌ Failed to fetch leaderboard:", error.response?.data || error.message);
    return [];
  }
}

async function getPlayerOneSignalId(playFabId) {
  try {
    const response = await axios.post(
      `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetUserData`,
      {
        PlayFabId: playFabId,
        Keys: ['OneSignalPlayerId']
      },
      {
        headers: {
          'X-SecretKey': PLAYFAB_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const oneSignalId = response.data.data.Data?.OneSignalPlayerId?.Value;
    console.log(`📬 OneSignal ID for ${playFabId}: ${oneSignalId}`);
    return oneSignalId || null;
  } catch (error) {
    console.error(`❌ Failed to fetch OneSignal ID for ${playFabId}:`, error.response?.data || error.message);
    return null;
  }
}

async function sendNotification(oneSignalId, message) {
  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [oneSignalId],
        headings: { en: "🏆 Leaderboard Update!" },
        contents: { en: message }
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ Notification sent:", response.data);
  } catch (error) {
    console.error("❌ Failed to send notification:", error.response?.data || error.message);
  }
}

async function main() {
  const leaderboard = await getLeaderboard();

  for (let i = 0; i < leaderboard.length; i++) {
    const player = leaderboard[i];
    const currentRank = i + 1;
    const previousRank = previousRanks[player.PlayFabId];

    console.log(`🧠 Player ${player.PlayFabId} - Current: ${currentRank}, Previous: ${previousRank}`);

    if (previousRank && currentRank > previousRank) {
      const oneSignalId = await getPlayerOneSignalId(player.PlayFabId);
      if (oneSignalId) {
        await sendNotification(oneSignalId, `You dropped to rank ${currentRank} on the leaderboard!`);
      } else {
        console.log(`⚠️ No OneSignal ID for ${player.PlayFabId}`);
      }
    }

    previousRanks[player.PlayFabId] = currentRank;
  }

  console.log("✅ Leaderboard checked.");
}

main().catch(err => {
  console.error("❌ Script failed:", err);
});
