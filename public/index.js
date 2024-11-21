// WebSocket connection setup
let ws = null;
let currentRoom = null;

// Function to initialize WebSocket connection
function initializeWebSocket() {
    ws = new WebSocket("wss://<your-vercel-domain>/api/realtime");

    // Connection opened
    ws.onopen = () => {
        console.log("Connected to WebSocket server");
    };

    // Listen for messages
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    // Handle connection close
    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };
}

// Function to send a message via WebSocket
function sendMessage(type, payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, payload }));
    } else {
        console.error("WebSocket is not connected");
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    if (data.type === "roomCreated") {
        alert(`Room "${data.payload.room}" created successfully!`);
    } else if (data.type === "roomJoined") {
        alert(`Joined room "${data.payload.room}"`);
    } else if (data.type === "message") {
        displayMessage(data.payload);
    }
}

// Function to display a message in the chat
function displayMessage(message) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.textContent = `${message.sender}: ${message.text}`;
    chatBox.appendChild(messageElement);
}

// Function to create a room
function createRoom() {
    const roomName = document.getElementById("roomNameInput").value.trim();
    if (roomName) {
        sendMessage("createRoom", { room: roomName });
        currentRoom = roomName;
        closeModal(); // Close the create room modal
    } else {
        alert("Please enter a valid room name.");
    }
}

// Function to join a room
function joinRoom() {
    const roomName = document.getElementById("roomNameInput").value.trim();
    if (roomName) {
        sendMessage("joinRoom", { room: roomName });
        currentRoom = roomName;
        closeModal(); // Close the create room modal
    } else {
        alert("Please enter a valid room name.");
    }
}

// Function to send a chat message
function sendChatMessage() {
    const messageInput = document.getElementById("messageInput").value.trim();
    if (messageInput && currentRoom) {
        sendMessage("message", { room: currentRoom, text: messageInput });
        document.getElementById("messageInput").value = ""; // Clear input field
    } else {
        alert("Please join a room and enter a message.");
    }
}

// Function to open the create room modal
function openModal() {
    document.getElementById("createRoomModal").style.display = "block";
}

// Function to close the create room modal
function closeModal() {
    document.getElementById("createRoomModal").style.display = "none";
}

// Function to open the info modal
function openInfoModal() {
    document.getElementById("infoModal").style.display = "block";
}

// Function to close the info modal
function closeInfoModal() {
    document.getElementById("infoModal").style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
    const infoModal = document.getElementById("infoModal");
    const createRoomModal = document.getElementById("createRoomModal");
    if (event.target == infoModal) {
        infoModal.style.display = "none";
    }
    if (event.target == createRoomModal) {
        createRoomModal.style.display = "none";
    }
};

// Function to navigate to table.html
function navigateToTable() {
    window.location.href = "table.html";
}

// Initialize WebSocket connection
initializeWebSocket();
