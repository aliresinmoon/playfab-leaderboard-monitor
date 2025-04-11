import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// PlayFab and OneSignal config
const PLAYFAB_TITLE_ID = '168AE2';
const PLAYFAB_SECRET_KEY = 'IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM';
const STATISTIC_NAME = 'PiPuzzle_LevelsCompleted';
const ONESIGNAL_APP_ID = '3ee530aa-8613-485b-9cbd-0263727badc5';
const ONESIGNAL_API_KEY = 'os_v2_app_h3stbkugcnefxhf5ajrxe65nyxwsit5mlbgudcn7e26hpn2lwdp7wmpcujs7p4mhjwiip63ils24iez2qln5ztvx6xy4cntvhmrd4xi';

// Path to the ranks.json file
const RANKS_FILE_PATH = path.resolve('ranks.json');

// Load previous ranks
async function loadPreviousRanks() {
  try {
    const data = await fs.readFile(RANKS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.log('⚠️ Could not load previous ranks, initializing fresh.');
    return {};
  }
}

// Save updated ranks
async function saveRanks(ranks) {
  await fs.writeFile(RANKS_FILE_PATH, JSON.stringify(ranks, null, 2), 'utf-8');
  console.log('💾 Saved updated ranks.');
}

// Fetch current leaderboard
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

// Get OneSignal Player ID from PlayFab
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

// Send notification
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

// Main logic
async function main() {
  const previousRanks = await loadPreviousRanks();
  const leaderboard = await getLeaderboard();

  console.log(`📊 Leaderboard fetched: ${leaderboard.length} players`);

  for (let i = 0; i < leaderboard.length; i++) {
    const player = leaderboard[i];
    const currentRank = i + 1;
    const previousRank = previousRanks[player.PlayFabId];

    console.log(`🧠 Player ${player.PlayFabId} - Current: ${currentRank}, Previous: ${previousRank}`);

    if (previousRank && currentRank > previousRank) {
      const oneSignalId = await getPlayerOneSignalId(player.PlayFabId);
      if (oneSignalId) {
        await sendNotification(oneSignalId, `You dropped to rank ${currentRank} in the leaderboard! ⚠️`);
      } else {
        console.log(`⚠️ No OneSignal ID found for ${player.PlayFabId}`);
      }
    }

    previousRanks[player.PlayFabId] = currentRank;
  }

  await saveRanks(previousRanks);
  console.log("✅ Leaderboard checked.");
}

main().catch(console.error);
