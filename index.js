const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");
const { LobbyRoom } = require("@colyseus/core");
const { monitor } = require("@colyseus/monitor");

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

// ✅ Colyseus Monitor (includes /rooms endpoint)
app.use("/colyseus", monitor());

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// ✅ Start server
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
