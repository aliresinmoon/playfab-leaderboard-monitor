from pathlib import Path

# Create index.js script
index_js = """
const axios = require("axios");
const PLAYFAB_TITLE_ID = "168AE2";
const PLAYFAB_SECRET_KEY = "IXUJIAQNTC6XPAWQ9N3K4ZNNBX3HNSINKX3OINR1RRJPAH5GYM";
const ONESIGNAL_APP_ID = "3ee530aa-8613-485b-9cbd-0263727badc5";
const ONESIGNAL_API_KEY = "vpntou3r4epvniqqgccoe2bxe";

const STATISTIC_NAME = "PiPuzzle_LevelsCompleted";
const STORED_RANKS_KEY = "lastKnownRanks";

const fs = require("fs");

async function getLeaderboard() {
    const response = await axios.post(
        `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetLeaderboard`,
        {
            StatisticName: STATISTIC_NAME,
            MaxResultsCount: 10
        },
        {
            headers: {
                "X-SecretKey": PLAYFAB_SECRET_KEY,
                "Content-Type": "application/json"
            }
        }
    );
    return response.data.data.Leaderboard;
}

async function sendNotification(oneSignalId, message) {
    await axios.post(
        "https://onesignal.com/api/v1/notifications",
        {
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: [oneSignalId],
            headings: { en: "Leaderboard Alert" },
            contents: { en: message }
        },
        {
            headers: {
                Authorization: `Basic ${ONESIGNAL_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );
}

async function getOneSignalId(playFabId) {
    const response = await axios.post(
        `https://${PLAYFAB_TITLE_ID}.playfabapi.com/Server/GetUserReadOnlyData`,
        {
            PlayFabId: playFabId,
            Keys: ["OneSignalPlayerId"]
        },
        {
            headers: {
                "X-SecretKey": PLAYFAB_SECRET_KEY,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data.data.Data?.OneSignalPlayerId?.Value || null;
}

async function main() {
    const leaderboard = await getLeaderboard();

    let lastKnownRanks = {};
    if (fs.existsSync(STORED_RANKS_KEY + ".json")) {
        lastKnownRanks = JSON.parse(fs.readFileSync(STORED_RANKS_KEY + ".json", "utf8"));
    }

    for (let i = 0; i < leaderboard.length; i++) {
        const player = leaderboard[i];
        const currentRank = i + 1;
        const prevRank = lastKnownRanks[player.PlayFabId];

        if (prevRank && currentRank > prevRank) {
            const oneSignalId = await getOneSignalId(player.PlayFabId);
            if (oneSignalId) {
                await sendNotification(oneSignalId, `You dropped to rank ${currentRank}! Someone just beat your record.`);
            }
        }

        lastKnownRanks[player.PlayFabId] = currentRank;
    }

    fs.writeFileSync(STORED_RANKS_KEY + ".json", JSON.stringify(lastKnownRanks));
}

main().catch(console.error);
"""

# Create GitHub Actions workflow
workflow_yml = """
name: Leaderboard Monitor

on:
  schedule:
    - cron: "*/5 * * * *"
  workflow_dispatch:

jobs:
  check_leaderboard:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install axios

      - name: Run leaderboard monitor
        run: node index.js
"""

# Save the files locally
Path("index.js").write_text(index_js.strip())
Path(".github/workflows/main.yml").parent.mkdir(parents=True, exist_ok=True)
Path(".github/workflows/main.yml").write_text(workflow_yml.strip())

import ace_tools as tools; tools.display_dataframe_to_user(name="Generated Files", dataframe=None)
