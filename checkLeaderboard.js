import axios from 'axios';

// PlayFab and OneSignal configuration
const PLAYFAB_TITLE_ID = '168AE2';
const PLAYFAB_SECRET_KEY = 'IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM';
const STATISTIC_NAME = 'PiPuzzle_LevelsCompleted';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'vpntou3r4epvniqqgccoe2bxe';

// Memory cache of previous ranks
let previousRanks = {};

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

async function getPlayerOneSignalId(playFabId) {
  const response = await axios.post(`https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetUserData`, {
    PlayFabId: playFabId,
    Keys: ['OneSignalPlayerId']
  }, {
    headers: {
      'X-SecretKey': PLAYFAB_SECRET_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data.Data?.OneSignalPlayerId?.Value || null;
}

async function sendNotification(oneSignalId, message) {
  await axios.post("https://onesignal.com/api/v1/notifications", {
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
}

async function main() {
  const leaderboard = await getLeaderboard();

  for (let i = 0; i < leaderboard.length; i++) {
    const player = leaderboard[i];
    const currentRank = i + 1;
    const previousRank = previousRanks[player.PlayFabId];

    if (previousRank && currentRank > previousRank) {
      const oneSignalId = await getPlayerOneSignalId(player.PlayFabId);
      if (oneSignalId) {
        await sendNotification(oneSignalId, `You dropped to rank ${currentRank} in the leaderboard! ⚠️`);
      }
    }

    previousRanks[player.PlayFabId] = currentRank;
  }

  console.log("✅ Leaderboard checked.");
}

main().catch(console.error);
