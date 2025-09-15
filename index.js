const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const path = require("path");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

const app = express();
const port = process.env.PORT || 2567;

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server,
});

app.use(cors());
app.use(express.json());

// ✅ Serve static files from /public (includes colyseus.js)
app.use(express.static(path.join(__dirname, "public")));

gameServer.define("game", GameRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);

// Health check
app.get("/health", (req, res) => {
  res.send("Server is running ✅");
});
