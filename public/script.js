// welcome text
const welcomeText = "Welcome to Genius Invokation TCG!";
let delay = 0;
for (let i=0; i<welcomeText.split(" ").length; i++) {
    let l;
    // each word
    for (let j=0; j<welcomeText.split(" ")[i].length; j++) {
        l = document.createElement("h1");
        l.textContent = welcomeText.split(" ")[i].substring(j, j+1); 
        document.getElementById("welcome").append(l);
        l.style.animationDelay = delay + "s";
        delay += 0.03;
    }
    // each space
    l.style.marginRight = "10px";
}

// show modal
function showModal(text=false) {
    if (text) document.getElementById("modalText").textContent = text;
    document.getElementById("modalContainer").style.display = "block";
}

// close modal
function closeModal() {
    document.getElementById("modalContainer").style.display = "none";
    document.getElementById("playerNameBoxLabel").style.display = "none";
    document.getElementById("playerNameBox").style.display = "none";
    document.getElementById("roomIDBoxLabel").style.display = "none";
    document.getElementById("roomIDBox").style.display = "none";
    document.getElementById("copyRoomIDdiv").style.display = "none";
    document.getElementById("joinGameBtn").style.display = "none";
    for (let i=0; i<2; i++) {
        document.getElementsByClassName("no")[i].style.display = "none";
    }
}

// connects to server
const socket = io(); 

document.getElementById("joinGameBtn").onclick = function() {
    socket.emit("join",     
        { 
        name: document.getElementById("playerNameBox").value,
        roomID: document.getElementById("roomIDBox").value
    }); 
    closeModal();
}

// successfully joined, 
// show that the player is in the waiting room if their name works
socket.on("createRoom",function(roomID) {
    showModal("Share this RoomID with someone to start your game! RoomID: " + roomID);
    // copy paste roomID
    document.getElementById("copyRoomIDdiv").style.display = "inline";
    document.getElementById("copyRoomIDdiv").onclick = function() {
        navigator.clipboard.writeText(roomID);
    };
});

socket.on("createGame",function(data) {

    // remove modal
    closeModal();

    // enable removal of modal by clicking outside
    window.onclick = function(event) {
        const c = document.getElementById("modalContainer");
        if (event.target == c) c.style.display = "none";
    }

    // remove roomID from screen
    // document.getElementById("roomID").textContent = "";

    // display character cards
    const img1 = document.getElementById("myChar");
    const img2 = document.getElementById("oppChar");
    const character1 = data["myChar"];
    const character2 = data["oppChar"];

    if (character1 == "Ganyu") img1.src = "https://static.wikia.nocookie.net/gensin-impact/images/8/87/Ganyu_Character_Card.png";
    else if (character1 == "Yoimiya") img1.src = "https://static.wikia.nocookie.net/gensin-impact/images/9/98/Yoimiya_Character_Card.png";
    else if (character1 == "Raiden") img1.src = "https://static.wikia.nocookie.net/gensin-impact/images/c/c9/Raiden_Shogun_Character_Card.png";
    else if (character1 == "Albedo") img1.src = "https://static.wikia.nocookie.net/gensin-impact/images/e/e4/Albedo_Character_Card.png";
    else if (character1 == "Kokomi") img1.src = "https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Sangonomiya_Kokomi_Character_Card.png";

    if (character2 == "Ganyu") img2.src = "https://static.wikia.nocookie.net/gensin-impact/images/8/87/Ganyu_Character_Card.png";
    else if (character2 == "Yoimiya") img2.src = "https://static.wikia.nocookie.net/gensin-impact/images/9/98/Yoimiya_Character_Card.png";
    else if (character2 == "Raiden") img2.src = "https://static.wikia.nocookie.net/gensin-impact/images/c/c9/Raiden_Shogun_Character_Card.png";
    else if (character2 == "Albedo") img2.src = "https://static.wikia.nocookie.net/gensin-impact/images/e/e4/Albedo_Character_Card.png";
    else if (character2 == "Kokomi") img2.src = "https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Sangonomiya_Kokomi_Character_Card.png";

    // display player info
    document.getElementById("myCharInfo").style.display = "block";
    document.getElementById("myPlayerName").textContent = data["myName"] + " (you)";
    document.getElementById("myCharHp").textContent = "HP: " + data["myCharHp"];

    document.getElementById("oppCharInfo").style.display = "block";
    document.getElementById("oppPlayerName").textContent = data["oppName"];
    document.getElementById("oppCharHp").textContent = "HP: " + data["oppCharHp"];

    // display attack buttons if turn, also modal
    if (data["yourTurn"]) {
        document.getElementById("attackButtonDiv").style.display = "inline";
        showModal("Your turn! Roll, then choose an attack.");
    }
    else {
        showModal("Waiting for opponent...");
    }    
});
// rolls
socket.on("roll", function(data) {
    const blocks = data["blocks"];
    const die = document.getElementById("diceContainer").children;
    for (let i=0; i<blocks.length; i++) {
        die[i].style.display = "block";
        if (blocks[i] == "anemo") die[i].style.background = "teal";
        else if (blocks[i] == "pyro") die[i].style.background = "red";
        else if (blocks[i] == "cryo") die[i].style.background = "cyan";
        else if (blocks[i] == "hydro") die[i].style.background = "royalblue";
        else if (blocks[i] == "geo") die[i].style.background = "saddlebrown";
        else if (blocks[i] == "electro") die[i].style.background = "purple";
        else if (blocks[i] == "dendro") die[i].style.background = "green";
        die[i].title = blocks[i];
    }
});

// for each turn 
socket.on("turnComplete", function(data) {
    // display player info
    document.getElementById("myCharInfo").style.display = "block";
    document.getElementById("myPlayerName").textContent = data["myName"];
    document.getElementById("myCharHp").textContent = "HP: " + data["myCharHp"];

    document.getElementById("oppCharInfo").style.display = "block";
    document.getElementById("oppPlayerName").textContent = data["oppName"];
    document.getElementById("oppCharHp").textContent = "HP: " + data["oppCharHp"];    

    // hide blocks
    const die = document.getElementById("diceContainer").children;
    for (let i=0; i<10; i++) {
        die[i].style.display = "none";
    }

    // display attack buttons if turn, otherwise hide
    // modal for:
    // 1. what happened (later if time)
    // 2. it's your turn to go!
    // 3. wait for your turn

    if (data["yourTurn"]) {
        document.getElementById("attackButtonDiv").style.display = "block";
        showModal("Your turn! Roll, then choose an attack.");
    }
    else {
        document.getElementById("attackButtonDiv").style.display = "none";
        showModal("Done! Wait for your turn now.");
    }



});

// winner 
socket.on("winner", function(data) {
    // no more blocks
    const die = document.getElementById("diceContainer").children;
    for (let i=0; i<10; i++) {
        die[i].style.display = "none";
    }
    // no more attack buttons
    document.getElementById("attackButtonDiv").style.display = "none";
    // display winner
    const winner = data["winner"];
    showModal(winner + " has won! Please refresh to start a new game.");
})

// buttons
const rollBtn = document.getElementById("roll");
const baBtn = document.getElementById("ba");
const sBtn = document.getElementById("s");
const bBtn = document.getElementById("b");

rollBtn.onclick = () => { socket.emit("roll"); }
baBtn.onclick = () => { socket.emit("attack", "ba"); }
sBtn.onclick = () => { socket.emit("attack", "s"); }
bBtn.onclick = () => { socket.emit("attack", "b"); }

// diconnect
socket.on("disconnect", function () {
    closeModal();
    showModal("You have been disconnected.");
});
// currently does not work
socket.on("roomNotFound", function() {
    closeModal();
    showModal("Room not found.");
})

// show join modal
setTimeout(function() {
    showModal();
}, 3000)