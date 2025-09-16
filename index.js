const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");
// ✅ Correct import for LobbyRoom
const { LobbyRoom } = require("@colyseus/core");
// ✅ Import monitor to expose /colyseus endpoints
const { monitor } = require("@colyseus/monitor");

const app = express();
const port = process.env.PORT || 2567;

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server,
});

app.use(cors());
app.use(express.json());

// ✅ Serve self-hosted Colyseus.js build
app.use("/colyseus.js", express.static(path.join(__dirname, "colyseus.js")));

// ✅ Register rooms
gameServer.define("game", GameRoom);
gameServer.define("lobby", LobbyRoom);

// ✅ Expose REST endpoints (/colyseus/rooms etc.)
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`✅ Listening on ws://localhost:${port}`);

// Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});
