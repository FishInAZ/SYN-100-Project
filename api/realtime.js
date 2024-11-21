const { Server } = require("ws");

const rooms = {}; // Store clients grouped by room

// Create WebSocket server
const wss = new Server({ noServer: true });

wss.on("connection", (ws) => {
  let currentRoom = null;
  let clientName = null;

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      switch (parsedMessage.type) {
        case "joinRoom": {
          const { room, name } = parsedMessage.payload;
          currentRoom = room;
          clientName = name;

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
          break;
        }
        case "message": {
          // Broadcast the chat message to all clients in the room
          if (currentRoom) {
            broadcastToRoom(currentRoom, {
              type: "message",
              payload: {
                sender: parsedMessage.payload.sender,
                text: parsedMessage.payload.text,
              },
            });
          }
          break;
        }
        default:
          console.warn("Unknown message type:", parsedMessage.type);
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
      broadcastToRoom(currentRoom, {
        type: "userLeft",
        payload: { name: clientName },
      });

      // Send the updated user list to the remaining clients
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

module.exports = (req, res) => {
  if (req.method === "GET") {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit("connection", ws, req);
    });
  }
};
