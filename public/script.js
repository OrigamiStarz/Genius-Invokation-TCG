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
    alert("Please wait for another player to join. \n\nYour RoomID: " + roomID);
});

socket.on("createGame",function(data) {
    console.log(data);
});

socket.on("disconnect", function () {
    alert("You have been disconnected.");
});

socket.on("roomNotFound", function() {
    alert("Room not found.");
})