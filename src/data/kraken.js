// src/data/kraken.js

const axios = require("axios");
const crypto = require("crypto");
const config = require("../../config/config.json");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

// Function to load cryptocurrency names from JSON file
async function loadCryptoData() {
  try {
    const filePath = path.join(__dirname, "cryptoNames.json"); // Construct the file path
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading crypto names:", error);
    throw error;
  }
}

// Load symbol mappings from config file
async function loadSymbolMappings() {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "config",
      "symbolMappings.json"
    );
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading symbol mappings:", error);
    throw error;
  }
}

// Function to write array values to a file
async function writeArrayToFile(array, filename) {
  try {
    const filePath = path.join(__dirname, "..", "preprocessing", filename);
    await fs.writeFile(filePath, array.join("\n"));
    console.log(`Values written to ${filename}`);
  } catch (error) {
    console.error(`Error writing values to ${filename}:`, error);
    throw error;
  }
}

// Function to map symbols to IDs
async function mapSymbolsToIDs() {
  try {
    const cryptoData = await loadCryptoData(); // Load cryptocurrency data from file

    const symbolToIDMap = {};
    cryptoData.forEach((crypto) => {
      const symbol = crypto.symbol.toUpperCase();
      symbolToIDMap[symbol] = crypto.id + ` (${crypto.symbol})`;
    });

    return symbolToIDMap;
  } catch (error) {
    console.error("Error mapping symbols to IDs:", error);
    throw error;
  }
}

// Function to get system status
async function getSystemStatus() {
  return await axios.get("https://api.kraken.com/0/public/SystemStatus");
}

// Function to get asset info (all assets)
async function getAssetInfo() {
  return await axios.get("https://api.kraken.com/0/public/Assets");
}

// Function to get tradable asset pairs
async function getTradablePairs() {
  return await axios.get("https://api.kraken.com/0/public/AssetPairs");
}

// Function to get tradable pairs where the quote currency is USDT
async function getPairsWithUSDT() {
  try {
    const response = await axios.get(
      "https://api.kraken.com/0/public/AssetPairs"
    );
    const pairs = response.data.result;

    const assetsWithUSDT = [];
    const mypairs = [];
    // Mapping of caveat symbols to their corresponding symbols
    const symbolMapping = await loadSymbolMappings(); // Load symbol mappings

    Object.keys(pairs).forEach((pair) => {
      const info = pairs[pair];
      if (info.quote === "USDT") {
        let base = info.base;
        // Check if the base symbol needs to be replaced
        if (symbolMapping[base]) {
          base = symbolMapping[base];
        }
        mypairs.push(info.altname);
        assetsWithUSDT.push(base);
      }
    });

    // Write mypairs to krakenresearch.txt
    await writeArrayToFile(mypairs, "krakenresearch.txt");

    const symbolToIDMap = await mapSymbolsToIDs(); // Map symbols to IDs

    const names = assetsWithUSDT.map(
      (symbol) => symbolToIDMap[symbol] || symbol
    ); // Map symbols to IDs

    // Write names to cgresearch.txt
    await writeArrayToFile(names, "cgresearch.txt");

    return "Loaded Successfully";
  } catch (error) {
    console.error(
      "Error fetching tradable assets with USDT from Kraken:",
      error
    );
    throw error;
  }
}

// Function to get ticker information for a pair
async function getTicker(pair) {
  return await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
}

// Function to get OHLC data for a pair
async function getOHLC(pair) {
  return await axios.get(`https://api.kraken.com/0/public/OHLC?pair=${pair}`);
}

// Function to get recent trades for a pair
async function getRecentTrades(pair) {
  return await axios.get(`https://api.kraken.com/0/public/Trades?pair=${pair}`);
}

async function queryPrivateEndpoint(endPointName, inputParameters) {
  try {
    const apiPublicKey = process.env.apiKey;
    const apiPrivateKey = process.env.apiSecret;
    const baseDomain = "https://api.kraken.com";
    const privatePath = "/0/private/";
    const apiEndpointFullURL = baseDomain + privatePath + endPointName;

    const nonce = (Date.now() * 1000).toString();
    const apiPostBodyData = "nonce=" + nonce + "&" + inputParameters;

    const signature = createAuthenticationSignature(
      apiPrivateKey,
      privatePath,
      endPointName,
      nonce,
      apiPostBodyData
    );

    const httpOptions = {
      headers: { "API-Key": apiPublicKey, "API-Sign": signature },
    };

    const jsonData = await axios.post(
      apiEndpointFullURL,
      apiPostBodyData,
      httpOptions
    );

    return jsonData.data;
  } catch (error) {
    console.error("Error querying private endpoint:", error);
    throw error;
  }
}

function createAuthenticationSignature(
  apiPrivateKey,
  apiPath,
  endPointName,
  nonce,
  apiPostBodyData
) {
  const apiPost = nonce + apiPostBodyData;
  const secret = Buffer.from(apiPrivateKey, "base64");
  const sha256 = crypto.createHash("sha256");
  const hash256 = sha256.update(apiPost).digest("binary");
  const hmac512 = crypto.createHmac("sha512", secret);
  const signatureString = hmac512
    .update(apiPath + endPointName + hash256, "binary")
    .digest("base64");
  return signatureString;
}

async function getAccountBalance() {
  try {
    const endPointName = "Balance";
    const inputParameters = "";
    const balanceData = await queryPrivateEndpoint(
      endPointName,
      inputParameters
    );
    //console.log("Account Balance:", balanceData.result);
    return balanceData.result;
  } catch (error) {
    console.error("Error fetching account balance:", error);
    throw error;
  }
}

async function getUSDTBalance() {
  try {
    const endPointName = "Balance";
    const inputParameters = "";
    const balanceData = await queryPrivateEndpoint(
      endPointName,
      inputParameters
    );
    const usdtBalance = balanceData.result.USDT;
    return usdtBalance;
  } catch (error) {
    console.error("Error fetching USDT balance:", error);
    throw error;
  }
}

async function getCurrentAssets() {
  try {
    const endPointName = "Balance";
    const inputParameters = "";
    const balanceData = await queryPrivateEndpoint(
      endPointName,
      inputParameters
    );

    // Filter out assets with balances greater than 0.0001
    const nonZeroBalances = {};
    Object.entries(balanceData.result).forEach(([asset, balance]) => {
      if (parseFloat(balance) > 0.0001) {
        nonZeroBalances[asset] = balance;
      }
    });

    //console.log("Non-zero Balances:", nonZeroBalances);
    return nonZeroBalances;
  } catch (error) {
    console.error("Error fetching current assets:", error);
    throw error;
  }
}

// Function to market buy
async function marketBuy(pair, volume) {
  try {
    const privateInputParameters = `pair=${pair}&type=buy&ordertype=market&volume=${volume}`;
    const response = await queryPrivateEndpoint(
      "AddOrder",
      privateInputParameters
    );
    console.log(response);
    if (response.error && response.error.length > 0) {
      console.error("Error creating market buy order:", response.error);
      throw new Error(response.error);
    }
    return response;
  } catch (error) {
    console.error("Error creating market buy order:", error.message);
    throw error;
  }
}
// Function to market sell
async function marketSell(pair, volume) {
  try {
    const privateInputParameters = `pair=${pair}&type=sell&ordertype=market&volume=${volume}`;
    const response = await queryPrivateEndpoint(
      "AddOrder",
      privateInputParameters
    );
    console.log(response);
    if (response.error && response.error.length > 0) {
      console.error("Error creating market sell order:", response.error);
      throw new Error(response.error);
    }
    return response;
  } catch (error) {
    console.error("Error creating market sell order:", error.message);
    throw error;
  }
}

module.exports = {
  getSystemStatus,
  getAssetInfo,
  getTradablePairs,
  getPairsWithUSDT,
  getTicker,
  getOHLC,
  getRecentTrades,
  getAccountBalance,
  getCurrentAssets,
  getUSDTBalance,
  marketBuy,
  marketSell,
};
