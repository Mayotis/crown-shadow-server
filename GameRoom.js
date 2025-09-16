// server/GameRoom.js
const colyseus = require("colyseus");
const schema = require("@colyseus/schema");
const { Schema, type, MapSchema } = schema;

/**
 * --- Player Schema ---
 * Mirrors client gameRef.current.players
 */
class PlayerState extends Schema {
  constructor() {
    super();
    this.id = "";
    this.type = "warrior"; // e.g., 'warrior' | 'princess'
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.width = 32;
    this.height = 32;
    this.grounded = false;
    this.holding = null; // objectId or sessionId
    this.heldBy = null;
    this.riding = null; // objectId
    this.direction = "right";
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.player_id = ""; // e.g., "player1" or "player2" from levels
  }
}
type("string")(PlayerState.prototype, "id");
type("string")(PlayerState.prototype, "type");
type("number")(PlayerState.prototype, "x");
type("number")(PlayerState.prototype, "y");
type("number")(PlayerState.prototype, "vx");
type("number")(PlayerState.prototype, "vy");
type("number")(PlayerState.prototype, "width");
type("number")(PlayerState.prototype, "height");
type("boolean")(PlayerState.prototype, "grounded");
type("string")(PlayerState.prototype, "holding");
type("string")(PlayerState.prototype, "heldBy");
type("string")(PlayerState.prototype, "riding");
type("string")(PlayerState.prototype, "direction");
type("number")(PlayerState.prototype, "animationFrame");
type("number")(PlayerState.prototype, "animationTimer");
type("string")(PlayerState.prototype, "player_id");

/**
 * --- Object Schema ---
 * Mirrors client gameRef.current.objects
 */
class ObjectState extends Schema {
  constructor() {
    super();
    this.id = "";
    this.type = ""; // box | button | door | sven | satellite | platform
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.width = 32;
    this.height = 32;
    this.collision_type = "solid"; // solid | trigger
    this.is_active = false;
    this.is_open = false;
    this.is_falling = false;
    this.direction = "";
    this.speed = 0;
    this.path_start_x = 0;
    this.path_end_x = 0;
    this.path_start_y = 0;
    this.path_end_y = 0;
    this.button_id = "";
    this.door_id = "";
  }
}
type("string")(ObjectState.prototype, "id");
type("string")(ObjectState.prototype, "type");
type("number")(ObjectState.prototype, "x");
type("number")(ObjectState.prototype, "y");
type("number")(ObjectState.prototype, "vx");
type("number")(ObjectState.prototype, "vy");
type("number")(ObjectState.prototype, "width");
type("number")(ObjectState.prototype, "height");
type("string")(ObjectState.prototype, "collision_type");
type("boolean")(ObjectState.prototype, "is_active");
type("boolean")(ObjectState.prototype, "is_open");
type("boolean")(ObjectState.prototype, "is_falling");
type("string")(ObjectState.prototype, "direction");
type("number")(ObjectState.prototype, "speed");
type("number")(ObjectState.prototype, "path_start_x");
type("number")(ObjectState.prototype, "path_end_x");
type("number")(ObjectState.prototype, "path_start_y");
type("number")(ObjectState.prototype, "path_end_y");
type("string")(ObjectState.prototype, "button_id");
type("string")(ObjectState.prototype, "door_id");

/**
 * --- Full Room State ---
 */
class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.objects = new MapSchema();
  }
}
type({ map: PlayerState })(GameState.prototype, "players");
type({ map: ObjectState })(GameState.prototype, "objects");

/**
 * --- Game Room Logic ---
 */
class GameRoom extends colyseus.Room {
  onCreate(options) {
    console.log("✅ GameRoom created:", options);
    this.setState(new GameState());

    this.maxClients = 2;

    this.onMessage("input", (client, input) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // Example: simple velocity assignment
      player.vx = input.left ? -200 : input.right ? 200 : 0;
      if (input.up && player.grounded) {
        player.vy = -400; // jump
        player.grounded = false;
      }
    });

    this.setMetadata({
      name: options.name || "Unnamed Room",
      hasPassword: !!options.password,
      clients: 0,
      maxClients: this.maxClients,
    });

    this.setSimulationInterval((dt) => this.update(dt));
  }

  onJoin(client, options) {
    console.log(`👤 Player ${client.sessionId} joined.`);
    const player = new PlayerState();
    player.id = client.sessionId;
    player.x = 100;
    player.y = 100;
    player.width = 32;
    player.height = 32;
    this.state.players.set(client.sessionId, player);

    this.setMetadata({
      ...this.metadata,
      clients: this.clients.length,
    });
  }

  onLeave(client, consented) {
    console.log(`👋 Player ${client.sessionId} left.`);
    this.state.players.delete(client.sessionId);

    this.setMetadata({
      ...this.metadata,
      clients: this.clients.length,
    });
  }

  update(dt) {
    const delta = dt / 1000;

    // Physics step for players
    this.state.players.forEach((player) => {
      player.x += player.vx * delta;
      player.y += player.vy * delta;
      player.vy += 800 * delta; // gravity
      if (player.y > 400) {
        player.y = 400;
        player.vy = 0;
        player.grounded = true;
      }
    });

    // Physics for objects can go here
  }
}

module.exports = { GameRoom };
