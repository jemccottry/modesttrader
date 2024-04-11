const kraken = require("../data/kraken");
const config = require("../../config/config.json");
const reverseSymbolMapping = require("../../config/reverseSymbolMapping.json");
const { writeToLog } = require("../utils/utils");

// Function to execute buy orders
async function executeBuyOrder(pair, price) {
  try {
    let volume = config.trading.defaultTrade / price;
    // Check for caveats
    if (pair === "BTCUSDT") {
      pair = "XBTUSDT";
    } else if (pair === "DOGEUSDT") {
      pair = "XDGUSDT";
    }
    const response = await kraken.marketBuy(pair, volume);
    return response;
  } catch (error) {
    throw error;
  }
}

// Function to execute sell orders
async function executeSellOrder(pair) {
  try {
    // Get base currency from the pair
    const baseCurrencyIndex = pair.indexOf("USDT");
    const baseCurrency =
      baseCurrencyIndex !== -1 ? pair.substring(0, baseCurrencyIndex) : pair;

    // Check if there is a symbol mapping for the base currency
    const krakenBaseCurrency =
      reverseSymbolMapping[baseCurrency] || baseCurrency;

    // Get current balance of the base currency
    const balance = await kraken.getAccountBalance();
    //console.log(balance);
    const baseBalance = balance[krakenBaseCurrency];
    //console.log(baseBalance);
    if (!baseBalance || parseFloat(baseBalance) <= 0) {
      writeToLog(`No balance of ${krakenBaseCurrency} available for selling.`);
      return;
    }

    // Execute sell order
    //const response = 10;
    const response = await kraken.marketSell(pair, baseBalance);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = { executeBuyOrder, executeSellOrder };
