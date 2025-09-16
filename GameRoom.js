// GameRoom.js
const colyseus = require("colyseus");
const schema = require("@colyseus/schema");
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
const type = schema.type;

// Player schema
class Player extends Schema {
  constructor() {
    super();
    this.x = 100;
    this.y = 100;
    this.vx = 0;
    this.vy = 0;
    this.action = "";
  }
}
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "vx");
type("number")(Player.prototype, "vy");
type("string")(Player.prototype, "action");

// State schema
class State extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}
type({ map: Player })(State.prototype, "players");

class GameRoom extends colyseus.Room {
  onCreate(options) {
    // initialize state & constraints
    this.setState(new State());
    this.maxClients = 2;

    // metadata for lobby listing
    this.setMetadata({
      name: options.name || "Game Room",
      hasPassword: !!options.password,
      clients: 0,
      maxClients: this.maxClients,
    });

    // bind input handler
    this.onMessage("input", (client, input) => {
      const p = this.state.players[client.sessionId];
      if (!p) return;
      // sanitize input: boolean fields only
      p.vx = 0;
      p.vy = 0;
      if (input.left) p.vx = -2;
      if (input.right) p.vx = 2;
      if (input.up) p.vy = -2;
      if (input.down) p.vy = 2;
      // optional action
      p.action = input.action || "";
    });

    // run server tick 20 times / second
    this.setSimulationInterval(() => this.update(), 1000 / 20);
  }

  update() {
    // simple position integration; also add bounds checks if needed
    for (const sessionId in this.state.players) {
      const p = this.state.players[sessionId];
      p.x += p.vx;
      p.y += p.vy;

      // clamp inside some reasonable bounds to avoid runaway
      if (p.x < 0) p.x = 0;
      if (p.y < 0) p.y = 0;
      if (p.x > 2000) p.x = 2000;
      if (p.y > 2000) p.y = 2000;
    }
  }

  onJoin(client, options) {
    // add player
    this.state.players[client.sessionId] = new Player();
    console.log(`Player ${client.sessionId} joined.`);

    // update metadata (so lobby sees player count)
    this.setMetadata({
      ...this.metadata,
      clients: this.clients.length,
    });
  }

  onLeave(client) {
    // remove player
    delete this.state.players[client.sessionId];
    console.log(`Player ${client.sessionId} left.`);

    // update metadata
    this.setMetadata({
      ...this.metadata,
      clients: this.clients.length,
    });
  }

  onDispose() {
    // cleanup if needed
    console.log("Disposing room", this.roomId);
  }
}

module.exports = { GameRoom };
