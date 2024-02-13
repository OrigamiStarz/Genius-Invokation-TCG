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

  getHp() { return this.hp; }

  getElement() { return this.element; }

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
    this.hasNotRolled = true;
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

  getPlayers() {
    return this.playerSockets;
  }

  // roll 10 random dice with different elements
  roll(socketid) {
    // make sure it is during their turn
    if (!this.isMyTurn(socketid) || !this.hasNotRolled) {
      console.log("Caught a cheater!!!");
      return -1;
    }
    this.hasNotRolled = false;
    for (let i = 0; i < 10; i++) {
      const randomElement = this.elements[Math.floor(Math.random() * this.elements.length)];
      this.blocks.push(randomElement);
    }
    return this.blocks;
  }

  // playing an attack (ends turn)
  attack(type, socketid) {
    console.log(playerName[socketid] + " attacked using a " + type + "!")
    // make sure it is during their turn
    if (!this.isMyTurn(socketid)) {
      console.log("Caught a cheater!!!");
      return -1;
    }
    let attackedPlayer;
    let dmg = 0;
    // get the character that is going to be attacked
    if (this.playerSockets[0] == socketid) attackedPlayer = this.characters[1];
    else attackedPlayer = this.characters[0]; 
    // attack the player!! if you have enough dice
    if (type == "ba") {
      // check if enough dice
      if (this.blocks.length >= 2)
        dmg = 2;
    }
    else if (type == "s") {
      // check if enough dice
      const targetElement = this.myCharacter(socketid).getElement();
      let count = 0;
      for (let i=0; i<this.blocks.length; i++) {
        if (this.blocks[i] == targetElement) count++;
      }
      if (count >= 3) {
        dmg = 3;
      }
      // if not enough dice, rip turn
    }
    else if (type == "b") {
      // check if enough dice
      const targetElement = this.myCharacter(socketid).getElement();
      let count = 0;
      for (let i=0; i<this.blocks.length; i++) {
        if (this.blocks[i] == targetElement) count++;
      }
      if (count >= 4) {
        dmg = 4;
      }
      // if not enough dice, rip turn
    }

    // if the character dies, end game
    if (!this.myCharacter(socketid).gotAttacked(dmg)) {
      return this.endGame();;
    }

    // switch turns
    if (this.turn == this.playerSockets[0]) this.turn = this.playerSockets[1];
    else this.turn = this.playerSockets[0];
    this.hasNotRolled = true;
    this.blocks = [];

    return 0;
  }
  endGame() {
    // not done
    if (this.turn == this.playerSockets[0]) {
      return playerName[this.playerSockets[0]];
    }
    return playerName[this.playerSockets[1]];
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
        myName: playerName[roomID[givenId]],
        oppName: playerName[socket.id],
        yourTurn: g.isMyTurn(roomID[givenId]),
        blocks: g.blocks,
        myChar: g.myCharacter(roomID[givenId]),
        oppChar: g.myCharacter(socket.id),
      });
      socket.emit("createGame", {
        myName: playerName[socket.id],
        oppName: playerName[roomID[givenId]],
        yourTurn: g.isMyTurn(socket.id), 
        blocks: g.blocks,
        myChar: g.myCharacter(socket.id),
        oppChar: g.myCharacter(roomID[givenId]),
      });
    } 
    // not found
    else {
      socket.emit("roomNotFound");
      socket.disconnect();
    }
    
  });

  socket.on("roll", function () {
    const blocks = games[socket.id].roll(socket.id);
    console.log(playerName[socket.id] + " rolled " + blocks);
    if (blocks == -1) return;
    socket.emit("roll", {blocks: blocks});
  });

  socket.on("attack", function(data) {
    let g = games[socket.id];
    const winner = g.attack(data, socket.id);
    let otherSocketId = g.getPlayers()[0];
    if (otherSocketId == socket.id) otherSocketId = g.getPlayers()[1];

    // no winner yet
    if (winner == 0) {
      // to player
      socket.emit("turnComplete", {
        myName: playerName[socket.id],
        oppName: playerName[otherSocketId],
        yourTurn: g.isMyTurn(socket.id), 
        myChar: g.myCharacter(socket.id),
        oppChar: g.myCharacter(playerName[otherSocketId])
      });
      // to opponent
      socket.to(otherSocketId).emit("turnComplete", {
        myName: playerName[otherSocketId],
        oppName: playerName[socket.id],
        yourTurn: g.isMyTurn(otherSocketId), 
        myChar: g.myCharacter(otherSocketId),
        oppChar: g.myCharacter(playerName[socket.id])
      });
    }
    // found a winner
    else {
      socket.emit("winner", {"winner": winner});
      socket.to(otherSocketId).emit("winner", {"winner": winner});
    }
  })

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