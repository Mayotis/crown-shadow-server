const colyseus = require("colyseus");
const schema = require("@colyseus/schema");
const { Schema, type, MapSchema } = schema;

// Player schema
class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("string") action = "";
}

// State schema
class State extends Schema {
  @type({ map: Player }) players = new MapSchema();
}

// Game room
class GameRoom extends colyseus.Room {
  onCreate(options) {
    this.setState(new State());

    this.onMessage("updateState", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.action = data.action;
      }
      // Broadcast update to other clients
      this.broadcast("playerUpdate", { id: client.sessionId, ...data }, { except: client });
    });
  }

  onJoin(client, options) {
    const player = new Player();
    this.state.players.set(client.sessionId, player);
    console.log(`Player ${client.sessionId} joined.`);
  }

  onLeave(client, consented) {
    this.state.players.delete(client.sessionId);
    console.log(`Player ${client.sessionId} left.`);
  }
}

module.exports = { GameRoom };
