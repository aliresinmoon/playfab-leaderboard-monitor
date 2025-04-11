import axios from 'axios';

// PlayFab and OneSignal configuration
const PLAYFAB_TITLE_ID = '168AE2';
const PLAYFAB_SECRET_KEY = 'IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM';
const STATISTIC_NAME = 'PiPuzzle_LevelsCompleted';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'os_v2_app_h3stbkugcnefxhf5ajrxe65nyxwsit5mlbgudcn7e26hpn2lwdp7wmpcujs7p4mhjwiip63ils24iez2qln5ztvx6xy4cntvhmrd4xi';

async function getLeaderboard() {
  const response = await axios.post(`https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetLeaderboard`, {
    StatisticName: STATISTIC_NAME,
    MaxResultsCount: 10
  }, {
    headers: {
      'X-SecretKey': PLAYFAB_SECRET_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.Leaderboard;
}

async function getUserData(playFabId, keys) {
  const response = await axios.post(`https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetUserData`, {
    PlayFabId: playFabId,
    Keys: keys
  }, {
    headers: {
      'X-SecretKey': PLAYFAB_SECRET_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.Data || {};
}

async function updateUserData(playFabId, data) {
  await axios.post(`https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/UpdateUserData`, {
    PlayFabId: playFabId,
    Data: data
  }, {
    headers: {
      'X-SecretKey': PLAYFAB_SECRET_KEY,
      'Content-Type': 'application/json'
    }
  });
}

async function sendNotification(oneSignalId, message) {
  console.log(`📤 Sending notification to ${oneSignalId}...`);
  const response = await axios.post("https://onesignal.com/api/v1/notifications", {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [oneSignalId],
    headings: { en: "🏆 Leaderboard Update!" },
    contents: { en: message }
  }, {
    headers: {
      Authorization: `Basic ${ONESIGNAL_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("🔔 Notification response:", response.data);
}

async function main() {
  const leaderboard = await getLeaderboard();
  console.log(`📊 Leaderboard fetched: ${leaderboard.length} players`);

  for (let i = 0; i < leaderboard.length; i++) {
    const player = leaderboard[i];
    const currentRank = i + 1;

    const userData = await getUserData(player.PlayFabId, ['LastKnownRank', 'OneSignalPlayerId']);
    const lastRankStr = userData.LastKnownRank?.Value;
    const oneSignalId = userData.OneSignalPlayerId?.Value;

    const lastRank = lastRankStr ? parseInt(lastRankStr) : undefined;

    console.log(`🧠 Player ${player.PlayFabId} - Current: ${currentRank}, Previous: ${lastRank}`);

    if (lastRank && currentRank > lastRank) {
      if (oneSignalId) {
        await sendNotification(oneSignalId, `You dropped to rank ${currentRank} in the leaderboard! ⚠️`);
      } else {
        console.log(`⚠️ No OneSignal ID for ${player.PlayFabId}`);
      }
    }

    await updateUserData(player.PlayFabId, {
      LastKnownRank: currentRank.toString()
    });
  }

  console.log("✅ Leaderboard checked.");
}

main().catch(console.error);
