// table.js

let players = [];
const radius = 150; // Radius for positioning avatars in a circle
let ws; // WebSocket connection

// Get HTML elements
const form = document.getElementById("joinForm");
const gameTable = document.getElementById("gameTable");
const playerNameInput = document.getElementById("player_name");

// Initialize WebSocket connection
function initializeWebSocket() {
    ws = new WebSocket("wss://<your-vercel-domain>/api/realtime");

    ws.onopen = () => {
        console.log("WebSocket connection established.");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed.");
    };
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
    if (data.type === "userJoined") {
        addPlayerToTable(data.payload.name, false); // Add a player without sending another message
    } else if (data.type === "roomUpdate") {
        updatePlayerList(data.payload.users);
    }
}

// Add player to the table
function addPlayerToTable(playerName, notifyServer = true) {
    // Check if player already exists
    if (players.find((player) => player.name === playerName)) return;

    // Create player avatar container
    const playerAvatar = document.createElement("div");
    playerAvatar.classList.add("player-avatar");

    // Create player name element
    const playerNameElement = document.createElement("div");
    playerNameElement.classList.add("player-name");
    playerNameElement.innerText = playerName;

    // Create player avatar image (tree image)
    const avatarImage = document.createElement("div");
    avatarImage.classList.add("avatar-image");

    // Assemble player avatar container
    playerAvatar.appendChild(playerNameElement);
    playerAvatar.appendChild(avatarImage);

    // Add to the game table
    gameTable.appendChild(playerAvatar);

    // Add player to the players array
    players.push({ name: playerName, element: playerAvatar });

    // Update avatar positions around the game table
    updatePlayerPositions();

    // Notify the server about the new player
    if (notifyServer && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                type: "joinRoom",
                payload: { room: "defaultRoom", name: playerName },
            })
        );
    }
}

// Update player positions around the game table
function updatePlayerPositions() {
    const angleStep = (2 * Math.PI) / players.length; // Divide the circle evenly for each player
    players.forEach((player, index) => {
        const angle = index * angleStep; // Calculate angle for each player
        const x = radius * Math.cos(angle); // Calculate x-coordinate
        const y = radius * Math.sin(angle); // Calculate y-coordinate
        player.element.style.transform = `translate(${x}px, ${y}px)`; // Apply position with CSS transform
    });
}

// Update player list based on WebSocket message
function updatePlayerList(userList) {
    // Remove all players from the game table
    players.forEach((player) => {
        gameTable.removeChild(player.element);
    });
    players = [];

    // Add players back to the table from the updated list
    userList.forEach((playerName) => {
        addPlayerToTable(playerName, false);
    });
}

// Event listener for the join form submission
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter a valid name!");
        return;
    }

    addPlayerToTable(playerName); // Add player to the table
    playerNameInput.value = ""; // Clear input field
});

// Initialize WebSocket connection when the script loads
initializeWebSocket();
