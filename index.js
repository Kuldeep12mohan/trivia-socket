const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json()); // Add JSON parsing middleware

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joining a room
  socket.on("joinRoom", ({ username, room }) => {
    if (!username || !room) {
      socket.emit("error", "Username and room are required");
      return;
    }

    socket.join(room);
    console.log(`${username} has joined room: ${room}`);

    io.to(room).emit("roomMembers", {
      message: `${username} has joined the room!`,
    });
  });

  // User disconnecting
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// Endpoint to start the game
app.post("/startGame", (req, res) => {
  const { room } = req.body;
  
  if (!room) {
    return res.status(400).json({ error: "Room is required" });
  }

  io.to(room).emit("startGame", { message: "The game is starting!" });
  res.json({ message: "Game start event sent to room." });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
