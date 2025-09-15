const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
const Schema = schema.Schema;
const MapSchema = schema.MapSchema;
const type = schema.type;

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

class State extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}

type({ map: Player })(State.prototype, "players");

class GameRoom extends colyseus.Room {
  onCreate(options) {
    this.setState(new State());

    this.onMessage("updateState", (client, data) => {
      const player = this.state.players[client.sessionId];
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.action = data.action;
      }
      // Broadcast to others
      this.broadcast("playerUpdate", { id: client.sessionId, ...data }, { except: client });
    });
  }

  onJoin(client, options) {
    const player = new Player();
    this.state.players[client.sessionId] = player;
    console.log(`Player ${client.sessionId} joined.`);
  }

  onLeave(client, consented) {
    delete this.state.players[client.sessionId];
    console.log(`Player ${client.sessionId} left.`);
  }
}

module.exports = { GameRoom };
