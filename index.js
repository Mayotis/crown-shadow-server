const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

// ✅ In Colyseus v0.16, LobbyRoom is inside @colyseus/core
const { LobbyRoom } = require("@colyseus/core");

const app = express();
const port = process.env.PORT || 2567;

const server = http.createServer(app);

const gameServer = new colyseus.Server({
  server,
});

// ✅ Express middleware
app.use(cors());
app.use(express.json());

// ✅ Serve self-hosted colyseus.js client
app.use("/colyseus.js", express.static(path.join(__dirname, "colyseus.js")));

// ✅ Define game room
gameServer.define("game", GameRoom);

// ✅ Define lobby room
gameServer.define("lobby", LobbyRoom);

gameServer.listen(port).then(() => {
  console.log(`✅ Colyseus listening on ws://localhost:${port}`);
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});
