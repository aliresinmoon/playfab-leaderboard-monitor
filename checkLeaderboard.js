import axios from 'axios';

// PlayFab and OneSignal configuration
const PLAYFAB_TITLE_ID = '168AE2';
const PLAYFAB_SECRET_KEY = 'IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM';
const STATISTIC_NAME = 'PiPuzzle_LevelsCompleted';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'os_v2_app_h3stbkugcnefxhf5ajrxe65nyxwsit5mlbgudcn7e26hpn2lwdp7wmpcujs7p4mhjwiip63ils24iez2qln5ztvx6xy4cntvhmrd4xi';

// Get leaderboard data from PlayFab
async function getLeaderboard() {
  const response = await axios.post(
    `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetLeaderboard`,
    {
      StatisticName: STATISTIC_NAME,
      MaxResultsCount: 100 // supports less than 10 too
    },
    {
      headers: {
        'X-SecretKey': PLAYFAB_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data.Leaderboard;
}

// Get OneSignal player ID from PlayFab User Data
async function getPlayerOneSignalId(playFabId) {
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

  return response.data.data.Data?.OneSignalPlayerId?.Value || null;
}

// Send push notification through OneSignal
async function sendNotification(oneSignalId, message) {
  console.log(`📤 Sending notification to ${oneSignalId}...`);
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

  console.log("🔔 Notification response:", response.data);
}

// Main function: send test notification to everyone on leaderboard
async function main() {
  const leaderboard = await getLeaderboard();

  if (!leaderboard || leaderboard.length === 0) {
    console.log("⚠️ No players found in leaderboard.");
    return;
  }

  for (let i = 0; i < leaderboard.length; i++) {
    const player = leaderboard[i];
    const currentRank = i + 1;

    const oneSignalId = await getPlayerOneSignalId(player.PlayFabId);
    if (oneSignalId) {
      await sendNotification(oneSignalId, `🧪 Test message: Your current rank is ${currentRank}`);
    } else {
      console.log(`⚠️ No OneSignalPlayerId found for PlayFabId: ${player.PlayFabId}`);
    }
  }

  console.log("✅ Leaderboard test notification finished.");
}

main().catch(console.error);
