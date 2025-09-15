const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
require("dotenv").config();

const { GameRoom } = require("./GameRoom");

const app = express();
const port = process.env.PORT || 2567;

const server = http.createServer(app);

// ✅ Add the /colyseus path here
const gameServer = new colyseus.Server({
  server,
  path: "/colyseus",
});

app.use(cors());
app.use(express.json());

// Register your GameRoom
gameServer.define("game", GameRoom);

// Start the server
gameServer.listen(port);

console.log(`Listening on ws://localhost:${port}/colyseus`);

// Health check for Render
app.get("/health", (req, res) => {
  res.send("Server is running");
});
