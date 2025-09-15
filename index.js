const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('colyseus');
const { WebSocketTransport } = require('@colyseus/ws-transport');
require('dotenv').config();

// Import your GameRoom
const { GameRoom } = require('./GameRoom');

const app = express();
const port = process.env.PORT || 2567; // Use PORT environment variable for Render
const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({ server }) // Correct transport class for Colyseus
});

app.use(cors());
app.use(express.json());

// Register your GameRoom
gameServer.define('game', GameRoom);

// Start the server
gameServer.listen(port);

console.log(`Listening on ws://localhost:${port}`);

// Optional: Health check endpoint for Render
app.get('/health', (req, res) => {
  res.send('Server is running');
});
