import express from "express";
import { Server } from "socket.io";
import https from "https"; // use https instead of http
import http from "http"; // use https instead of
import fs from "fs";
import cors from "cors";
import { linkify } from "./ExtractURLMetadata.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: ["https://localhost:5173", process.env.FRONT_END_URL], // Allow this specific origin
    methods: "GET,POST,PUT,DELETE", // Allow specific methods
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(express.json());
const PORT = process.env.PORT || 8000;
const SSL_CRT_FILE = process.env.SSL_CRT_FILE || "../cert/localhost+2.pem"; // your certificate file
const SSL_KEY_FILE = process.env.SSL_KEY_FILE || "../cert/localhost+2-key.pem"; // your private key file
// Read SSL certificate and key
const sslOptions = {
  key: fs.readFileSync(SSL_KEY_FILE),
  cert: fs.readFileSync(SSL_CRT_FILE),
};
// to store data of users
// Const Users= {socketID:{username:test,SocketId:84274,roomId:472384}}
const Users = {};
// Room data
/* const Rooms = {
  room_id: {
    Active_users: ["username1", "username2"],
    Active_user_socketIDs: ["socketID1", "socketID2"],
    Room_topic: "",
  }
};
}
*/
const Rooms = {};
// Create an HTTP server using the Express app
// const server = https.createServer(sslOptions, app);
const server = http.createServer(app);
// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: ["https://localhost:5173", process.env.FRONT_END_URL],
    methods: ["GET", "POST"],
    credentials: true,
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
    res.status(200).json({ message: responseData });
  } catch (err) {
    console.log("Error: " + err);
    res.status(500).json({ message: "Failed to extract URL metadata" });
  }
});

// const emitUpdatedUserList = (socketID,roomID) => {
//   if (!Rooms[roomID]) {
//     console.log("[error]: Room not found");
//     return;
//   }
//   const otherUserSocketIDs = Rooms[roomID].Active_user_socketIDs.filter(
//     (id) => id !== socketID
//   );
//   io.to(roomID).emit("AllConnectedUsers", { users: otherUserSocketIDs });
// };

//socket.io implementation
io.on("connection", (socket) => {
  socket.emit("YourSocketId", { socketID: socket.id });
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
  socket.on("disconnect", () => {
    console.log(`Disconnected User:${socket.id}`);
    const { roomId, username } = Users[socket.id] || {};

    if (roomId && Rooms[roomId]) {
      const userIndex = Rooms[roomId].Active_users.indexOf(username);
      if (userIndex !== -1) Rooms[roomId].Active_users.splice(userIndex, 1);

      const socketIndex = Rooms[roomId].Active_user_socketIDs.indexOf(
        socket.id
      );
      if (socketIndex !== -1)
        Rooms[roomId].Active_user_socketIDs.splice(socketIndex, 1);

      // Optionally delete the room if no users are left
      if (Rooms[roomId].Active_users.length === 0) {
        delete Rooms[roomId];
      }
    }

    delete Users[socket.id];
    // emitUpdatedUserList(socket.id, roomId); // Update other users in the room
    socket.broadcast
      .to(roomId)
      .emit("user-left-meeting", { username: Users[socket.id]?.username });
    //  delete Users[socket.id];
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
        Active_user_socketIDs: [],
        Room_topic: room_topic,
      };
    }

    // Add the user to the active users list in the room
    Rooms[room_id].Active_users.push(username);
    Rooms[room_id].Active_user_socketIDs.push(socket.id);

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
    Rooms[room_id].Active_user_socketIDs.push(socket.id);
    // Save the user in the Users object with the roomId
    Users[socket.id] = {
      ...Users[socket.id],
      username: username,
      roomId: room_id,
    };
    // emitUpdatedUserList(socket.id,room_id);
    // Emit the "user-joined-meeting" event
    socket.broadcast.to(room_id).emit("user-joined-meeting", {
      socketId: socket.id,
      username: username,
      roomId: room_id,
      peerID: peerID,
    });
  });

  // send message to the room
  socket.on("send", ({ type, message, username, timeStamp }) => {
    const roomId = Users[socket.id]?.roomId;
    if (!roomId) return;

    if (type === "text") {
      socket.broadcast.to(roomId).emit("new-incomming-message", {
        username: username,
        message: message,
        type: "text",
        timeStamp: timeStamp,
      });
    }
    if (type === "file") {
      socket.broadcast.to(roomId).emit("new-incomming-message", {
        username: username,
        message: message,
        type: "file",
        timeStamp: timeStamp,
      });
    }
  });

  socket.on("getAllConnectedUsers", ({ room_id }) => {
    if (!Rooms[room_id]) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // Filter out the current user's socket ID
    const otherUserSocketIDs = Rooms[room_id].Active_user_socketIDs;

    socket.emit("AllConnectedUsers", { users: otherUserSocketIDs, yourSocketID:socket.id });
  });

  // simple-peer signal forwarding
  socket.on("callUser", ({ userToCall, signalData }) => {
    console.log(`User ${socket.id} is calling ${userToCall}`);
    io.to(userToCall).emit("incommingCall", { signalData, from: socket.id });
  });
  // simple-peer signal forwarding
  socket.on("acceptingCall", ({ acceptingCallFrom, signalData }) => {
    console.log(
      `User ${socket.id} is accepting call from ${acceptingCallFrom}`
    );
    io.to(acceptingCallFrom).emit("callAccepted", {
      signalData,
      from: socket.id,
    });
  });
  //audio State change : implement io.on('audioStateChange')
  socket.on("audioStateChange", (state) => {
    const roomId = Users[socket.id].roomId;
    if (roomId) {
      io.to(roomId).emit("audioStateChange", {
        userId: socket.id,
        state,
      });
    }
  });
  // video State change : implement io.on('videoStateChange')
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
const IP = "0.0.0.0"; // Listen on all network interfaces
server.listen(PORT, IP, (error) => {
  try {
    console.log(`Server listening on ${PORT}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
});
