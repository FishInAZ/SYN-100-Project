const { Server } = require("ws");

const rooms = {}; // Store clients grouped by room

// Create WebSocket server
const wss = new Server({ noServer: true });

wss.on("connection", (ws) => {
  let currentRoom = null;

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "joinRoom") {
        const { room, name } = parsedMessage.payload;
        currentRoom = room;

        // Create the room if it doesn't exist
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = [];
        }

        // Add the new client to the room
        rooms[currentRoom].push({ ws, name });

        // Notify all clients in the room
        broadcastToRoom(currentRoom, {
          type: "userJoined",
          payload: { name },
        });

        // Send the updated user list to all clients in the room
        sendRoomUpdate(currentRoom);
      } else if (parsedMessage.type === "message") {
        // Broadcast the message to all clients in the room
        if (currentRoom) {
          broadcastToRoom(currentRoom, {
            type: "message",
            payload: { sender: parsedMessage.payload.sender, text: parsedMessage.payload.text },
          });
        }
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    if (currentRoom && rooms[currentRoom]) {
      // Remove the client from the room
      rooms[currentRoom] = rooms[currentRoom].filter((client) => client.ws !== ws);

      // Notify others in the room
      sendRoomUpdate(currentRoom);

      // Clean up the room if it's empty
      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
      }
    }
  });

  // Broadcast a message to all clients in a specific room
  function broadcastToRoom(room, message) {
    if (rooms[room]) {
      rooms[room].forEach((client) => {
        if (client.ws.readyState === ws.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      });
    }
  }

  // Send the updated user list to all clients in the room
  function sendRoomUpdate(room) {
    const users = rooms[room]?.map((client) => client.name) || [];
    broadcastToRoom(room, { type: "roomUpdate", payload: { users } });
  }
});

// Export the WebSocket server
module.exports = (req, res) => {
  if (req.method === "GET") {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit("connection", ws, req);
    });
  }
};
