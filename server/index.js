import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
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
const io = new Server(server);
//socket.io implementation
io.on("connection", (socket) => {
  socket.emit("me", { socketId: socket.id });
  console.log(`Connected User:${socket.id}`);
  Users[socket.id] = { socketId: socket.id };
  // diconnect method
  socket.on("disconnect", () => {
    console.log(`User Disconnected:${socket.id}`);
    // delete user from the Users object
    delete Users[socket.id]
    delete Rooms[Users[socket.id].roomId].Active_users[
      Rooms[Users[socket.id].roomId].Active_users.indexOf(
        Users[socket.id].username
      )
    ];
  });
  // remove username from room  
  socket.on("leaveRoom", ({ username, room_id }) => {
    console.log(`${username} left room ${room_id}`);
    // remove username from active_users array in Rooms object
    delete Rooms[room_id].Active_users[Rooms[room_id].Active_users.indexOf(username)];
    io.to(room_id).emit("message", { username: `${username} left` });
    socket.leave(room_id);
    
  });
  // Create a new Room
  socket.on("createRoom", ({ username, room_topic }) => {
    const room_id = Math.floor(Math.random() * 100000);
    socket.join(room_id);
    console.log(`${username} created room ${room_id}`);
    // save user in the room object
    Rooms[room_id] = {
      Active_users: [username],
      Room_topic: room_topic,
    };
    // save user in the Users object with roomId
    Users[socket.id] = {...Users[socket.id],username: username, roomId: room_id};
    io.to(room_id).emit("message", { username: `${username} created` });
  });
  // join an existing room method
  socket.on("joinRoom", ({ username, room_id }) => {
    socket.join(room_id);
    console.log(`${username} joined room ${room_id}`);
    // save user in the room object
    Rooms[room_id].Active_users.push(username);
    // save user in the Users object with roomId
    Users[socket.id]= {...Users[socket.id], username: username , roomId: room_id}
    io.to(room_id).emit("message", { username: `${username} joined` });
  });
  // send message to the room
  socket.on("send", (message) => {
    if (message.type == "text") {
      socket.broadcast.emit("message", {
        name: users[socket.id],
        message: message.msg,
        type: "text",
      });
    }
    if (message.type == "file") {
      socket.broadcast.emit("message", {
        name: users[socket.id],
        url: message.url,
        type: "file",
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
