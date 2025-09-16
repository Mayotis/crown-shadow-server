const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");
const { LobbyRoom } = require("@colyseus/core");

const app = express();
const port = process.env.PORT || 2567;

const server = http.createServer(app);

const gameServer = new colyseus.Server({
  server,
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve self-hosted Colyseus client
app.use("/colyseus.js", express.static(path.join(__dirname, "colyseus.js")));

// ✅ Register rooms
gameServer.define("game", GameRoom);
gameServer.define("lobby", LobbyRoom);

// ✅ Start server
gameServer.listen(port).then(() => {
  console.log(`✅ Colyseus listening on ws://localhost:${port}`);
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});
