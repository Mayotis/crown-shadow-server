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

// ✅ Serve colyseus.js for clients
app.use(
  "/colyseus.js",
  express.static(path.join(__dirname, "node_modules/colyseus.js/dist/colyseus.js"))
);

gameServer.define("game", GameRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);

app.get("/health", (req, res) => {
  res.send("Server is running");
});
