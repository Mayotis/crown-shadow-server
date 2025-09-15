const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

const app = express();
const port = process.env.PORT || 2567;

app.use(cors()); // ✅ enable CORS
app.use(express.json());

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server,
});

// Register your custom GameRoom
gameServer.define("game", GameRoom);

// ✅ Register the built-in LobbyRoom so `/colyseus/rooms` works
const { LobbyRoom } = require("colyseus");
gameServer.define("lobby", LobbyRoom);

gameServer.listen(port);

console.log(`Listening on ws://localhost:${port}`);

// Health check for Render
app.get("/health", (req, res) => {
  res.send("Server is running");
});
