const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const tradeExecution = require("../trade-execution/tradeexecution");
const { writeToLog } = require("../utils/utils");

const dataDir = path.join(__dirname, "../data");
const openTradesFile = path.join(dataDir, "opentrades.txt");
const completedTradesFile = path.join(dataDir, "completedtrades.csv");
let openTrades = [];

// Load open trades from file on startup
try {
  const data = fs.readFileSync(openTradesFile, "utf8");
  if (data) {
    openTrades = JSON.parse(data);
  }
} catch (error) {
  console.error("Error reading open trades file:", error);
}

async function processWebhookMessage(message) {
  const { pair, indicator, price } = parseWebhookMessage(message);
  const uuid = crypto.randomBytes(8).toString("hex");
  const timestamp = new Date().toISOString();

  if (indicator === "BUY") {
    // Check if the pair is not already in the array
    if (!openTrades.some((trade) => trade.pair === pair)) {
      //openTrades.push({ uuid, pair, price, timestamp });
      //console.log(`Added trade: Pair = ${pair}, Price = ${price}`);
      // Execute buy order
      try {
        await tradeExecution.executeBuyOrder(pair, price);
        openTrades.push({ uuid, pair, price, timestamp });
        saveOpenTradesToFile();
        writeToLog(`Buy order executed successfully for pair: ${pair}`);
      } catch (error) {
        writeToLog(
          `ERROR-DecisionMaking- error executing buy order for pair: ${pair} - ${error}`
        );
      }
    } else {
      writeToLog(`Pair (${pair}) already exists`);
    }
  } else if (indicator === "SELL") {
    // Check if the pair is in the array before executing sell order
    const tradeIndex = openTrades.findIndex((trade) => trade.pair === pair);
    if (tradeIndex !== -1) {
      const storedTrade = openTrades[tradeIndex];
      const storedID = storedTrade.uuid;
      const storedPrice = storedTrade.price;
      // Check is the price is higher than when the buy was executed, if yes then sell, if not then wait
      // Note this is a strategy for a bull market anbd should be reevaluated for a bear or neural market
      //This test has a precision calculation out to 12 zeros. Currently shib goes out 4 zeros so this is not an issue
      if (price / storedPrice - 1 > 0) {
        //console.log("Good enough to sell");
        // Execute sell order
        try {
          await tradeExecution.executeSellOrder(pair);
          // Write completed trade to CSV
          writeCompletedTradeToCSV(storedTrade, price);
          // Remove the pair from open trades
          openTrades.splice(tradeIndex, 1);
          // Write updated open trades to file
          saveOpenTradesToFile();
          writeToLog(`Sell order executed successfully for pair: ${pair}`);
        } catch (error) {
          writeToLog(
            `ERROR-DecisionMaking- error executing sell order for pair: ${pair} - ${error}`
          );
        }
      } else {
        writeToLog(
          `ID ${storedID} - Buy price was ${storedPrice} and sell price was ${price}. Waiting for a better price. `
        );
      }
    } else {
      writeToLog(
        `Pair ${pair} is not in the list of open trades. Skipping sell order.`
      );
    }
  }
}

function saveOpenTradesToFile() {
  fs.writeFileSync(openTradesFile, JSON.stringify(openTrades), "utf8");
}

function writeCompletedTradeToCSV(buyTrade, sellPrice) {
  const { uuid, pair, price, timestamp } = buyTrade;
  const currentTime = new Date().toISOString();
  const line = `${uuid},${pair},${timestamp},${price},${currentTime},${sellPrice}\n`;
  fs.appendFileSync(completedTradesFile, line, "utf8");
}

function parseWebhookMessage(message) {
  // Example message format: "DOTUSDT - BUY - Price = 9.3802 - Alert Time = 2024-03-25T02:24:00Z"
  const [pair, indicator, price] = message.split(" - ").map((item) => {
    const keyValue = item.split(" = ");
    return keyValue.length > 1 ? keyValue[1] : item;
  });
  return { pair, indicator, price };
}

function getOpenTrades() {
  return openTrades;
}

module.exports = {
  processWebhookMessage,
  getOpenTrades,
};
