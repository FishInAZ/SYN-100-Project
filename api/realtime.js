const { Server } = require("ws");

let clients = [];

// 创建 WebSocket 服务器
const wss = new Server({ noServer: true });

wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("message", (message) => {
    // 将收到的消息广播给所有客户端
    clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

module.exports = (req, res) => {
  if (req.method === "GET") {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit("connection", ws, req);
    });
  }
};
