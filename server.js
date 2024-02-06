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

class Game {
  constructor(players) {
    // this.players = players;
    // console.log("Game starts!" + this.playerNames);
  }
  round() {

  }
} // end of Game class

let queue = [];
io.on("connection", function (socket) {
  console.log("NEW CONNECTION!!", socket.id);
  // join a game
  socket.on("join", function (name) {
    // no "" as names
    if (name === "") {
      name = "Player " + (Math.floor(Math.random() * 1000) + 1);
    }
    playerName[socket.id] = name.substring(0, 16); 
    // add player to queue
    if (queue.indexOf(socket.id) == -1) {
      queue.push(socket.id);
    } 
    else {
      // disconnect if client double joins
      return socket.disconnect();
    }
    // if there are 2 players, start game
    if (queue.length == 2) {
      let players = queue.splice(0, 2)
      const g = new Game(players); 
      for (let i=0; i<players.length; i++) {
        games[players[i]] = g;
      }
    } // wait room if not 2 players yet 
    else {
      socket.emit("waitRoom");
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