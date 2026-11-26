const path = require("node:path");
const http = require("node:http");
const express = require("express");
const WebSocket = require("ws");

const PORT = Number(process.env.PORT) || 8080;
const app = express();
const rooms = new Map();

const publicDir = path.join(__dirname, "dist");

app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "jackson4",
    rooms: rooms.size
  });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: "/ws"
});

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function broadcast(room, message) {
  for (const player of room.players) {
    send(player.socket, message);
  }
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      players: [],
      state: null
    });
  }

  return rooms.get(roomId);
}

wss.on("connection", (socket) => {
  let room = null;
  let player = null;
  let roomId = null;

  send(socket, {
    type: "connected"
  });

  socket.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(socket, {
        type: "error",
        message: "JSON形式のメッセージではありません。"
      });
      return;
    }

    if (message.type === "join") {
      roomId = String(message.room || "main")
        .trim()
        .slice(0, 40) || "main";

      room = getRoom(roomId);

      if (room.players.length >= 2) {
        send(socket, {
          type: "error",
          message: "この部屋は満員です。"
        });

        socket.close();
        return;
      }

      player = room.players.length === 0 ? "A" : "B";

      room.players.push({
        socket,
        player
      });

      send(socket, {
        type: "joined",
        room: roomId,
        player
      });

      broadcast(room, {
        type: "players",
        count: room.players.length
      });

      return;
    }

    if (!room || !player) {
      send(socket, {
        type: "error",
        message: "先に対戦部屋へ参加してください。"
      });

      return;
    }

    if (["place", "orbit", "restart", "state"].includes(message.type)) {
      const event = {
        ...message,
        player
      };

      if (message.type === "state") {
        room.state = message.state ?? null;
      }

      broadcast(room, event);
    }
  });

  socket.on("close", () => {
    if (!room || !player) {
      return;
    }

    room.players = room.players.filter(
      (entry) => entry.socket !== socket
    );

    broadcast(room, {
      type: "players",
      count: room.players.length
    });

    if (room.players.length === 0 && roomId) {
      rooms.delete(roomId);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Jackson 4 server: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
