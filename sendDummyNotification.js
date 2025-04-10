import axios from 'axios';

const PLAYFAB_TITLE_ID = "168AE2";
const PLAYFAB_SECRET_KEY = "IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM";
const ONESIGNAL_APP_ID = "3ee530aa-8613-485b-9cbd-0263727badc5";
const ONESIGNAL_API_KEY = "vpntou3r4epvniqqgccoe2bxe";

// Fetch all player profiles with OneSignal IDs from PlayFab (paged)
async function fetchAllPlayerIds() {
  let skip = 0;
  const pageSize = 100;
  const playerIds = [];

  while (true) {
    const response = await axios.post(
      `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Admin/GetAllUsers`,
      {
        TitleId: PLAYFAB_TITLE_ID,
        Limit: pageSize,
        Offset: skip,
      },
      {
        headers: {
          "X-SecretKey": PLAYFAB_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const users = response.data?.Users || [];
    for (const user of users) {
      const readOnlyData = user.Data;
      const oneSignalId = readOnlyData?.OneSignalPlayerId?.Value;
      if (oneSignalId) {
        playerIds.push(oneSignalId);
      }
    }

    if (users.length < pageSize) break;
    skip += pageSize;
  }

  return playerIds;
}

async function sendNotification() {
  try {
    const playerIds = await fetchAllPlayerIds();

    if (playerIds.length === 0) {
      console.log("No OneSignal Player IDs found.");
      return;
    }

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: playerIds,
      headings: { en: "Test Notification" },
      contents: { en: "This is a test notification sent from GitHub Actions." },
    };

    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      payload,
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Notification sent. Response:");
    console.log(response.data);
  } catch (error) {
    console.error("❌ Failed to send notification:", error.response?.data || error.message);
  }
}

sendNotification();
