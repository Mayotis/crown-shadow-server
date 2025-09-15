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

    this.onMessage("updateState", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.action = d
