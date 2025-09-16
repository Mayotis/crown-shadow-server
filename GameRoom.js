// GameRoom.js
const colyseus = require("colyseus");
const schema = require("@colyseus/schema");
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
const type = schema.type;

// --- Player schema ---
class Player extends Schema {
  constructor() {
    super();
    this.id = "";
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.holding = null;
    this.heldBy = null;
    this.riding = null;
    this.direction = "right";
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.width = 32;
    this.height = 32;
    this.type = "warrior";
    this.player_id = "";
  }
}
type("string")(Player.prototype, "id");
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "vx");
type("number")(Player.prototype, "vy");
type("boolean")(Player.prototype, "grounded");
type("string")(Player.prototype, "holding");
type("string")(Player.prototype, "heldBy");
type("string")(Player.prototype, "riding");
type("string")(Player.prototype, "direction");
type("number")(Player.prototype, "animationFrame");
type("number")(Player.prototype, "animationTimer");
type("number")(Player.prototype, "width");
type("number")(Player.prototype, "height");
type("string")(Player.prototype, "type");
type("string")(Player.prototype, "player_id");

// --- Object schema ---
class GameObject extends Schema {
  constructor() {
    super();
    this.id = "";
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.type = "box";
    this.width = 32;
    this.height = 32;
    this.collision_type = "solid";
    this.is_active = false;
    this.is_open = false;
    this.is_falling = false;
    this.direction = "none";
    this.speed = 0;
  }
}
type("string")(GameObject.prototype, "id");
type("number")(GameObject.prototype, "x");
type("number")(GameObject.prototype, "y");
type("number")(GameObject.prototype, "vx");
type("number")(GameObject.prototype, "vy");
type("string")(GameObject.prototype, "type");
type("number")(GameObject.prototype, "width");
type("number")(GameObject.prototype, "height");
type("string")(GameObject.prototype, "collision_type");
type("boolean")(GameObject.prototype, "is_active");
type("boolean")(GameObject.prototype, "is_open");
type("boolean")(GameObject.prototype, "is_falling");
type("string")(GameObject.prototype, "direction");
type("number")(GameObject.prototype, "speed");

// --- State schema ---
class State extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.objects = new MapSchema();
  }
}
type({ map: Player })(State.prototype, "players");
type({ map: GameObject })(State.prototype, "objects");

// --- GameRoom ---
class GameRoom extends colyseus.Room {
  onCreate(options) {
    this.setState(new State());
    this.maxClients = 2;

    this.onMessage("input", (client, data) => {
      const player = this.state.players[client.sessionId];
      if (!player) return;

      const speed = 5;
      if (data.left) { player.vx = -speed; player.direction = "left"; }
      else if (data.right) { player.vx = speed; player.direction = "right"; }
      else { player.vx = 0; }

      if (data.up) { player.vy = -speed; } 
      else { player.vy = 0; }

      player.x += player.vx;
      player.y += player.vy;
    });
  }

  onJoin(client, options) {
    const player = new Player();
    player.id = client.sessionId;
    player.x = 100;
    player.y = 100;
    this.state.players[client.sessionId] = player;
    console.log(`Player joined: ${client.sessionId}`);
  }

  onLeave(client) {
    delete this.state.players[client.sessionId];
    console.log(`Player left: ${client.sessionId}`);
  }
}

module.exports = { GameRoom };
