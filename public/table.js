// WebSocket connection
let ws = null;
const roomID = "12345"; // Example Room ID (you can generate dynamically if needed)

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
        console.log(`${data.payload.playerName} joined the game.`);
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

// Event listener for the chat send button
document.getElementById("sendChatBtn").addEventListener("click", () => {
    const chatMessageInput = document.getElementById("chatMessage");
    const message = chatMessageInput.value.trim();
    if (message) {
        // Send chat message to WebSocket server
        ws.send(JSON.stringify({
            type: "chatMessage",
            room: roomID,
            payload: { sender: "Player", message } // Replace "Player" with actual player name
        }));
        chatMessageInput.value = ""; // Clear input field
    }
});

// Add event listener to the "Start Game" button
document.getElementById("startGameBtn").addEventListener("click", () => {
    // Redirect to game.html
    window.location.href = "game.html";
});

// Initialize WebSocket connection
initializeWebSocket();
