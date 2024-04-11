// src/webhooks/webhook.js

const http = require("http");
const config = require("../../config/config.json");

// Define the webhook endpoint
const webhookEndpoint = "/webhook"; // Define your desired endpoint path

// Function to listen for webhook alerts from TradingView
function listen(callback) {
  const server = http.createServer((req, res) => {
    // Check if the request matches the webhook endpoint
    if (req.url === webhookEndpoint && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          // Parse the JSON body of the webhook request
          //const data = JSON.parse(body);
          const data = body;
          // Validate the webhook request (optional)
          // Implement validation logic if needed

          // Process the received alert message
          const message = data; // Modify this line based on the structure of the alert message
          callback(message);

          // Respond to the webhook request
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Webhook received successfully");
        } catch (error) {
          console.error("Error processing webhook:", error);
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Error processing webhook");
        }
      });
    } else {
      // Respond with 404 if the request does not match the webhook endpoint
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  });

  // Start the HTTP server to listen for incoming webhook requests
  server.listen(config.webhook.port, () => {
    //console.log(`Webhook server is running on port ${config.webhook.port}`);
    //console.log(`Webhook endpoint: http://localhost:${config.webhook.port}${webhookEndpoint}`);
  });
}

module.exports = {
  listen,
};
