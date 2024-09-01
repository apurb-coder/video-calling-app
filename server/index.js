import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { linkify } from "./ExtractURLMetadata.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow this specific origin
    methods: "GET,POST,PUT,DELETE", // Allow specific methods
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(express.json());
const PORT = process.env.PORT || 8000;

// to store data of users
// Const Users= {socketID:{username:test,SocketId:84274,roomId:472384}}
const Users = {};
// Room data
/* Rooms = {
    room_id:{
        Active_users: [username1, username2],
        Room_topic: "",
    }
}
*/
const Rooms = {};

// Create an HTTP server using the Express app
const server = http.createServer(app);
// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // or specify allowed origins like "http://localhost:3000"
  },
});

// endpoint to get all active users in a room, Required data from front-end side: roomId
app.get("/getActiveUsers", (req, res) => {
  const room_id = req.query.room; // send in params from front-end side
  if (Rooms[room_id]) {
    res.status(200).json({ topic: Rooms[room_id].Active_users });
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

app.get("/topic", (req, res) => {
  const room_id = req.query.room; // send in params from front-end side
  if (Rooms[room_id]) {
    res.json({ topic: Rooms[room_id].Room_topic });
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

// Extract URL metadata
app.get("/extracturlmetadata", async (req, res) => {
  try {
    const chat = req?.body?.data;
    const responseData = await linkify(chat);
    res.status(200).json({ message: responseData});
  } catch (err) {
    console.log("Error: " + err);
    res.status(500).json({ message: "Failed to extract URL metadata" });
  }
});
//socket.io implementation
io.on("connection", (socket) => {
  socket.emit("me", { socketId: socket.id });
  console.log(`Connected User:${socket.id}`);

  socket.on("leaveRoom", ({ username, room_id }) => {
    console.log(`User Disconnected:${socket.id}`);

    // Retrieve roomId before deleting the user from Users
    const { roomId } = Users[socket.id] || {};

    if (roomId && Rooms[roomId]) {
      // Find the index of the username in the Active_users array
      const userIndex = Rooms[roomId].Active_users.indexOf(username);

      if (userIndex !== -1) {
        // Remove the user from the Active_users array
        Rooms[roomId].Active_users.splice(userIndex, 1);
      }

      // Optionally, delete the room if no active users remain
      if (Rooms[roomId].Active_users.length === 0) {
        delete Rooms[roomId];
      }
    }

    // Delete user from the Users object
    delete Users[socket.id];
    socket.broadcast
      .to(room_id)
      .emit("user-left-meeting", { username: username });
    socket.leave(room_id);
  });
  // Create a new Room
  // Functioning: emit an event createRoom from client side -> server is listening to createRoom event and it creates a room , make the user join the room -> emit user-joined-meet to inform client, user joined meet sucessfully
  socket.on("createRoom", ({ username, room_id, room_topic }) => {
    socket.join(room_id);
    console.log(
      `${username} joined or created room ${room_id} socketID: ${socket.id}`
    );

    // If the room doesn't exist, create it
    if (!Rooms[room_id]) {
      Rooms[room_id] = {
        Active_users: [],
        Room_topic: room_topic,
      };
    }

    // Add the user to the active users list in the room
    Rooms[room_id].Active_users.push(username);

    // Save the user in the Users object with the roomId
    Users[socket.id] = {
      ...Users[socket.id],
      username: username,
      roomId: room_id,
    };

    // Emit the "user-joined-meeting" event
    socket.broadcast.to(room_id).emit("user-joined-meeting", {
      socketId: socket.id,
      username: username,
      roomId: room_id,
    });
  });

  // join an existing room method
  // Functioning: emit an event joinRoom from client side -> server is listening to joinRoom event and it adds the user to the room -> emit user-joined-meet, to tell client user sucessfully
  socket.on("joinRoom", ({ username, room_id, peerID }) => {
    if (!Rooms[room_id]) {
      socket.emit("error", { message: "Room not found" });
      console.log("Room not found ", room_id);

      return;
    }
    console.log(`Received joinRoom with peerID: ${peerID}`);
    socket.join(room_id);
    console.log(`${username} joined room ${room_id}`);

    // Add the user to the active users list in the room
    Rooms[room_id].Active_users.push(username);

    // Save the user in the Users object with the roomId
    Users[socket.id] = {
      ...Users[socket.id],
      username: username,
      roomId: room_id,
    };

    // Emit the "user-joined-meeting" event
    socket.broadcast.to(room_id).emit("user-joined-meeting", {
      socketId: socket.id,
      username: username,
      roomId: room_id,
      peerID: peerID,
    });
  });

  // send message to the room
  socket.on("send", ({ type, message, username }) => {
    const roomId = Users[socket.id].roomId;
    if (!roomId) return;

    if (type === "text") {
      socket.broadcast.to(roomId).emit("new-incomming-message", {
        username: username,
        message: message,
        type: "text",
      });
    }
    if (type === "file") {
      socket.broadcast.to(roomId).emit("new-incomming-message", {
        username: username,
        url: message,
        type: "file",
      });
    }
  });

  // TODO: audio State change : implement io.on('audioStateChange')
  socket.on("audioStateChange", (state) => {
    const roomId = Users[socket.id].roomId;
    if (roomId) {
      io.to(roomId).emit("audioStateChange", {
        userId: socket.id,
        state,
      });
    }
  });
  // TODO: video State change : implement io.on('videoStateChange')
  socket.on("videoStateChange", (state) => {
    const roomId = Users[socket.id].roomId;
    if (roomId) {
      io.to(roomId).emit("videoStateChange", {
        userId: socket.id,
        state,
      });
    }
  });
});
server.listen(PORT, (error) => {
  try {
    console.log(`Server listening on ${PORT}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
});
