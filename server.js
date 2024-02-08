const express = require("express");
const app = express();
const http = require("http");

app.use(express.static("./public"));

const server = http.createServer(app);
const io = require("socket.io")(server, {
  pingInterval: 1000 * 5,
  pingTimeout: 30 * 60 * 1000 
});

let playerName = {}; // keeps track of user data
let games = {}; // keeps track of what game a user is in

class Player {
  constructor(n, ba, baCost, s, sCost, b, bCost, e) {
    this.name = n;
    this.energy = 3;
    this.hp = 10;
    this.basicAttack = ba;
    this.basicAttackCost = baCost;
    this.skill = s;
    this.skillCost = sCost;
    this.burst = b;
    this.burstCost = bCost;
    this.element = e;  // ex. cryo
  }
}

class Game {
  constructor(players, playerNames) {
    this.players = players;
    this.playerNames = playerNames;
    console.log("Game starts!" + this.playerNames);

    // create 2 "players" (randomize from list)
    let characters = [
      new Player("Ganyu", 1, 2, 2, 2, 4, 3, "cryo"), 
      new Player("Yoimiya", 1, 2, 2, 2, 4, 3, "pyro"), 
      new Player("Keqing", 1, 2, 2, 2, 4, 3, "electro"), 
      new Player("Zhongli", 1, 2, 2, 2, 4, 3, "geo"), 
      new Player("Furina", 1, 2, 2, 2, 4, 3, "hydro")
    ];
  }
  roll() {
    // return rolls
  }
  attack() {
    // playing an attack (ends turn)
  }
} // end of Game class

let roomID = {};
io.on("connection", function (socket) {
  console.log("NEW CONNECTION!!", socket.id);
  // join a game
  socket.on("join", function (data) {
    name = data["name"];
    givenId = data["roomID"]
    // no "" as names
    if (!name) {
      name = "Player " + (Math.floor(Math.random() * 1000) + 1);
    }
    // set player name
    playerName[socket.id] = name.substring(0, 16); 
    // check if player is creating a room
    console.log(data);
    if (givenId == "") {
      r = (Math.floor(Math.random() * 999999) + 1)
      roomID[r] = socket.id;
      console.log("Created room " + r);
      socket.emit("createRoom", r);
    }
    // if there are 2 players, start game
    else if (givenId in roomID) {
      // delete room
      // ehhh code later if time
      // create game
      const players = [roomID[givenId], socket.id];
      const g = new Game(players, [[playerName[roomID[givenId]], playerName[socket.id]]]); 
      for (let i=0; i<players.length; i++) {
        games[players[i]] = g;
      }
      // start game
      socket.emit("createGame", {
        players: [playerName[roomID[givenId]], playerName[socket.id]]
      });
    } 
    // not found
    else {
      socket.emit("roomNotFound");
      socket.disconnect();
    }
  });

  // add more functions here

});

// server listening
server.listen(process.env.PORT || 3000, "0.0.0.0", function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});