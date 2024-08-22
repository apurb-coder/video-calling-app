import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

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
// Const Users= {socketId:{username:test,SocketId:84274,roomId:472384}}
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
  const room_id = req.params.room; // send in params from front-end side
  if (Rooms[room_id]) {
    res.json(Rooms[room_id].Active_users);
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

//socket.io implementation
io.on("connection", (socket) => {
  socket.emit("me", { socketId: socket.id });
  console.log(`Connected User:${socket.id}`);
  Users[socket.id] = { socketId: socket.id };
  socket.on("connect_error", (err) => {
    console.error("Connection Error:", err.message);
  });
  // disconnect method
  socket.on("disconnect", () => {
    console.log(`User Disconnected:${socket.id}`);

    // Retrieve roomId and username before deleting the user from Users
    const { roomId, username } = Users[socket.id] || {};

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
  });

  // remove username from room
  socket.on("leaveRoom", ({ username, room_id }) => {
    console.log(`${username} left room ${room_id}`);
    // remove username from active_users array in Rooms object
    delete Rooms[room_id].Active_users[
      Rooms[room_id].Active_users.indexOf(username)
    ];
    io.to(room_id).emit("message", { username: `${username} left` });
    socket.leave(room_id);
  });
  // Create a new Room
  // Functioning: emit an event createRoom from client side -> server is listening to createRoom event and it creates a room , make the user join the room -> emit user-joined-meet to inform client, user joined meet sucessfully
  socket.on("createRoom", ({ username, room_id, room_topic }) => {
    socket.join(room_id);
    console.log(`${username} joined or created room ${room_id}`);

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
  socket.on("joinRoom", ({ username, room_id }) => {
    if (!Rooms[room_id]) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

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
    });
  });

  // send message to the room
  socket.on("send", (message) => {
    const roomId = Users[socket.id].roomId;
    if (!roomId) return;

    if (message.type === "text") {
      io.to(roomId).emit("message", {
        name: Users[socket.id].username,
        message: message.msg,
        type: "text",
      });
    }
    if (message.type === "file") {
      io.to(roomId).emit("message", {
        name: Users[socket.id].username,
        url: message.url,
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
