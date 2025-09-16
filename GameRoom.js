const colyseus = require("colyseus");
const schema = require("@colyseus/schema");
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
const type = schema.type;

// Player schema
class Player extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.action = "";
  }
}
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("string")(Player.prototype, "action");

// State schema
class State extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}
type({ map: Player })(State.prototype, "players");

// Game room
class GameRoom extends colyseus.Room {
  onCreate(options) {
    this.setState(new State());
    this.maxClients = 2;

    // ✅ Simulation loop at 20 ticks/sec
    this.setSimulationInterval(() => this.update());

    this.onMessage("input", (client, data) => {
      const player = this.state.players[client.sessionId];
      if (player) {
        player.action = data.action;
      }
    });

    // Metadata for lobby
    this.setMetadata({
      name: options.name || "Game Room",
      hasPassword: !!options.password,
      clients: 0,
      maxClients: this.maxClients,
    });
  }

  update() {
    // Apply actions each tick
    for (const id in this.state.players) {
      const p = this.state.players[id];
      if (p.action === "left") p.x -= 2;
      if (p.action === "right") p.x += 2;
      if (p.action === "up") p.y -= 2;
      if (p.action === "down") p.y += 2;
    }
  }

  onJoin(client, options) {
    this.state.players[client.sessionId] = new Player();
    console.log(`Player ${client.sessionId} joined.`);

    this.setMetadata({
      ...this.metadata,
      clients: this.clients.length,
    });
  }

  onLeave(client) {
    delete this.state.players[client.sessionId];
    console.log(`Player ${client.sessionId} left.`);

    this.setMetadata({
      ...this.metadata,
      clients: this.clients.length,
    });
  }
}

module.exports = { GameRoom };
