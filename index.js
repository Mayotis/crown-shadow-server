const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

const app = express();
const port = process.env.PORT || 2567;

// ✅ Enable CORS for *all* requests
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);

const gameServer = new colyseus.Server({
  server,
});

// Register your GameRoom
gameServer.define("game", GameRoom);

// Health check
app.get("/health", (req, res) => {
  res.send("Server is running ✅");
});

// Start listening
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
