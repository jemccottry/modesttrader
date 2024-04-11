const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../utils");
const logFile = path.join(logsDir, "log.txt");

function writeToLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFile, logMessage, "utf8");
}

module.exports = {
  writeToLog,
};
