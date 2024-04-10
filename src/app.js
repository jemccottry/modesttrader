// src/app.js

const readline = require("readline");
const {
  getSystemStatus,
  getPairsWithUSDT,
  getUSDTBalance,
  getCurrentAssets,
} = require("./data/kraken");
const { listen: webhookListener } = require("./webhooks/webhook");
const {
  processWebhookMessage,
  getOpenTrades,
} = require("./decision-making/decisionmaking");
const config = require("../config/config.json");

async function main() {
  try {
    // Initialize the ModestTrader application
    console.log("Initializing ModestTrader...");

    // Fetch system status
    const systemStatus = await getSystemStatus();
    console.log("Kraken System Status:", systemStatus.data);

    // Fetch tradable pairs
    const tradablePairs = await getPairsWithUSDT();
    console.log("Kraken Tradable Pairs:", tradablePairs);

    // Fetch account balance
    const availbalance = await getUSDTBalance();
    console.log("Trading Balance: ", availbalance);

    // Fetch current assets
    const curassets = await getCurrentAssets();
    console.log("Current Assets: ", curassets);

    // Start webhook listener
    webhookListener((message) => {
      //console.log("Received webhook message:", message);
      processWebhookMessage(message);
    });

    // Listen for key inputs
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.setPrompt("Press 'q' to quit, 'o' to see open trades: ");
    rl.prompt();

    rl.on("line", (input) => {
      if (input.trim() === "q") {
        rl.question(
          "Are you sure you want to quit the program? (y/n) ",
          (answer) => {
            if (answer.trim().toLowerCase() === "y") {
              rl.close();
            } else {
              rl.prompt();
            }
          }
        );
      } else if (input.trim() === "o") {
        console.log("Open trades:", getOpenTrades());
        rl.prompt();
      } else {
        rl.prompt();
      }
    });

    rl.on("close", () => {
      console.log("Exiting ModestTrader...");
      process.exit(0);
    });

    // Start main loop (placeholder)
    console.log("Starting main loop...");
    // Replace this with your main trading logic
  } catch (error) {
    console.error("Error initializing ModestTrader:", error);
  }
}

// Run the main function
main();
