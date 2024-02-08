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
    this.hp = 10;
    this.basicAttack = ba;
    this.basicAttackCost = baCost;
    this.skill = s;
    this.skillCost = sCost;
    this.burst = b;
    this.burstCost = bCost;
    this.element = e;  // ex. cryo
  }

  ba() {return this.ba};
  s() {return this.s};
  b() {return this.b};

  gotAttacked(dmg) {
    this.hp -= dmg;
    return this.hp > 0;  // return if they're alive
  }
}

class Game {
  constructor(players, playerNames) {
    this.playerSockets = players;
    this.playerNames = playerNames;
    this.elements = ["cryo", "pyro", "electro", "geo", "hydro", "anemo", "dendro"];
    this.blocks = [];
    this.turn = this.playerSockets[Math.floor(Math.random() * 2)];
    console.log("Game starts!" + this.playerNames);

    // create 2 "players" (randomize from list)
    let characters = [
      new Player("Ganyu", 1, 2, 2, 2, 4, 3, "cryo"), 
      new Player("Yoimiya", 1, 2, 2, 2, 4, 3, "pyro"), 
      new Player("Raiden", 1, 2, 2, 2, 4, 3, "electro"), 
      new Player("Albedo", 1, 2, 2, 2, 4, 3, "geo"), 
      new Player("Kokomi", 1, 2, 2, 2, 4, 3, "hydro")
    ];

    // give a random character to each player
    let randInt1 = characters[Math.floor(Math.random() * characters.length)];
    let randInt2 = characters[Math.floor(Math.random() * characters.length)];

    while (randInt1 == randInt2)
      randInt2 = characters[Math.floor(Math.random() * characters.length)];

    this.characters = [
      characters[Math.floor(Math.random() * characters.length)],
      characters[Math.floor(Math.random() * characters.length)]
    ];
  }

  myCharacter(socketid) {
    return this.characters[this.playerSockets.indexOf(socketid)];
  }

  isMyTurn(socketid) {
    return this.turn == socketid;
  }

  hasEnoughDice(type, num) {
    let s = 0;
    if (type == "any") return true;  // haha
    for (let i=0; i<10; i++) {
      if (this.blocks[i] == type) s++;
    }
    return s >= num;
  }

  // roll 10 random dice with different elements
  roll() {
    for (let i = 0; i < 10; i++) {
      const randomElement = this.elements[Math.floor(Math.random() * this.elements.length)];
      this.blocks.push(randomElement);
    }
    return this.blocks;
  }

  // playing an attack (ends turn)
  attack(type, socketid) {
    // make sure it is during their turn
    if (!this.isMyTurn(socketid)) {
      console.log("Caught a cheater!!!");
      return;
    }
    let attackedPlayer;
    let dmg;
    // get the character that is going to be attacked
    if (this.playerSockets[0] == socketid) attackedPlayer = this.characters[1];
    else attackedPlayer = this.characters[0]; 
    // attack the player!! if you have enough dice
    if (type == "ba") {
      // ... there's basically always enough dice LOL since no cards
      dmg = 2;
    }
    else if (type == "s") {
      // check if enough dice

      // if not, end game cuz I'm not dealing with it

      dmg = 3; 

    }
    else if (type == "b") {
      // check if enough dice

      // if not, end game cuz I'm not dealing with it

      dmg = 4;
    }


    // if the character dies, end game
    if (!character.gotAttacked(dmg)) {
      this.endGame();
      return;
    }

    // switch turns
    if (this.turn == this.playerSockets[0]) this.turn = this.playerSockets[1];
    else this.turn = this.playerSockets[0];
    this.blocks = [];
  }
  endGame() {
    return "rip";
  }
} // end of Game class

let roomID = {};
io.on("connection", function (socket) {
  console.log("NEW CONNECTION!!", socket.id);
  // join a game
  socket.on("join", function (data) {
    n = data["name"];
    givenId = data["roomID"]
    // no "" as names
    if (!n) {
      n = "Player " + (Math.floor(Math.random() * 1000) + 1);
    }
    // set player name
    playerName[socket.id] = n.substring(0, 16); 
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
      socket.to(roomID[givenId]).emit("createGame", {
        players: [playerName[roomID[givenId]], playerName[socket.id]],
        yourTurn: g.isMyTurn(roomID[givenId]),
        blocks: g.blocks,
        character: g.myCharacter(roomID[givenId])
      });
      socket.emit("createGame", {
        players: [playerName[roomID[givenId]], playerName[socket.id]],
        yourTurn: g.isMyTurn(socket.id), 
        blocks: g.blocks,
        character: g.myCharacter(socket.id)
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