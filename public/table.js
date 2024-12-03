// WebSocket connection
let ws = null;
const roomID = "SYN 100";
const maxPlayers = 5;
let players = []; // Array to keep track of joined players

// Establish WebSocket connection
function initializeWebSocket() {
    ws = new WebSocket("wss://your-vercel-domain/api/realtime");

    ws.onopen = () => {
        console.log("Connected to WebSocket server");
        // Inform server that this client has joined the room
        ws.send(JSON.stringify({ type: "joinRoom", room: roomID }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
    if (data.type === "chatMessage") {
        // Display chat message
        displayMessage(data.payload.sender, data.payload.message);
    } else if (data.type === "playerJoined") {
        addPlayerToList(data.payload.playerName);
    }
}

// Function to display a chat message in the chat container
function displayMessage(sender, message) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.innerText = `${sender}: ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

// Add player to the list and update the UI
function addPlayerToList(playerName) {
    if (players.length < maxPlayers && !players.includes(playerName)) {
        players.push(playerName);
        const playerList = document.getElementById("playerList");
        const playerItem = document.createElement("li");
        playerItem.innerText = playerName;
        playerList.appendChild(playerItem);

        // Check if maxPlayers have joined
        if (players.length === maxPlayers) {
            document.getElementById("startGameBtn").disabled = false; // Enable Start Game button
        }
    }
}

// Event listener for the "Join Game" form
document.getElementById("joinForm").addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
    const playerNameInput = document.getElementById("player_name");
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        // Send playerJoined message to WebSocket server
        ws.send(JSON.stringify({
            type: "playerJoined",
            room: roomID,
            payload: { playerName }
        }));
        playerNameInput.value = ""; // Clear the input field
    } else {
        document.getElementById("errorMessage").innerText = "Please enter a valid name.";
    }
});

// Event listener for the "Start Game" button
document.getElementById("startGameBtn").addEventListener("click", () => {
    if (players.length === maxPlayers) {
        // Redirect to game.html
        window.location.href = "game.html";
    } else {
        alert(`Waiting for ${maxPlayers - players.length} more players to join.`);
    }
});

// Initialize WebSocket connection
initializeWebSocket();
