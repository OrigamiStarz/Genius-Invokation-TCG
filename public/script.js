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

// socket.emit("setWord",input.value);

// successfully joined, 
// show that the player is in the waiting room if their name works
socket.on("waitRoom",function() {
    alert("Please wait for another player to join.");
});
  

socket.on("disconnect", function () {
    alert("You have been disconnected.");
});