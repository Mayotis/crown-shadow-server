const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

const app = express();
const port = process.env.PORT || 2567;

app.use(cors({ origin: "*" })); // 👈 Allow all origins
app.use(express.json());

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server,
});

// Register GameRoom
gameServer.define("game", GameRoom);

// Health check
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// Start
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
