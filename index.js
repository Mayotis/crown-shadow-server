const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

const app = express();
const port = process.env.PORT || 2567;

// ✅ Enable CORS for all origins
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Serve self-hosted colyseus.js UMD build
app.use("/colyseus.js", express.static(path.join(__dirname, "colyseus.js")));

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server,
});

// ✅ Register rooms
gameServer.define("game", GameRoom);

// ✅ Add a lobby room
const { LobbyRoom } = require("colyseus");
gameServer.define("lobby", LobbyRoom);

// ✅ Add the /colyseus/rooms endpoint manually
app.get("/colyseus/rooms", async (req, res) => {
  try {
    const rooms = await gameServer.matchMaker.query({});
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// ✅ Start server
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
