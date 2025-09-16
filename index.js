const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

// 🚀 Correct import for LobbyRoom on v0.16
const { LobbyRoom } = require("@colyseus/core");
const { monitor } = require("@colyseus/monitor");

const app = express();
const port = process.env.PORT || 2567;

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server,
});

app.use(cors());
app.use(express.json());

// ✅ Serve self-hosted Colyseus client
app.use("/colyseus.js", express.static(path.join(__dirname, "colyseus.js")));

// ✅ Register rooms
gameServer.define("game", GameRoom);

// ✅ Register LobbyRoom properly
gameServer.define("lobby", LobbyRoom);

// ✅ Add REST monitor for availableRooms, etc.
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);

// Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});
