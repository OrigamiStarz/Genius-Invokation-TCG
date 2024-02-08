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

// connects to server
const socket = io(); 

setTimeout(() => {
    socket.emit("join",{ 
        name: prompt("Enter Player Name: "), 
        roomID: prompt("Enter RoomID (leave blank if none): ")
    });    
}, 3000)

// successfully joined, 
// show that the player is in the waiting room if their name works
socket.on("createRoom",function(roomID) {
    console.log(roomID);
    alert("Please wait for another player to join. \n\nYour RoomID: " + roomID);
});

socket.on("createGame",function(data) {
    const img = document.getElementById("card");
    console.log(data);
    let character = data["character"];
    if (character == "Ganyu") img.src = "https://static.wikia.nocookie.net/gensin-impact/images/8/87/Ganyu_Character_Card.png";
    else if (character == "Yoimiya") img.src = "https://static.wikia.nocookie.net/gensin-impact/images/9/98/Yoimiya_Character_Card.png";
    else if (character == "Raiden") img.src = "https://static.wikia.nocookie.net/gensin-impact/images/c/c9/Raiden_Shogun_Character_Card.png";
    else if (character == "Albedo") img.src = "https://static.wikia.nocookie.net/gensin-impact/images/e/e4/Albedo_Character_Card.png";
    else if (character == "Kokomi") img.src = "https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Sangonomiya_Kokomi_Character_Card.png";
});

socket.on("disconnect", function () {
    alert("You have been disconnected.");
});

socket.on("roomNotFound", function() {
    alert("Room not found.");
})