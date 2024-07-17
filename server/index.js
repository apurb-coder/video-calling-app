import express from 'express';
import Server from "socket.io"
import http from "http";


const app = express();
const PORT= process.env.PORT || 8000;

// to store data of users
// Const Users= [Username:{username:test,personal_room_id:84274}]
const Users = []
// Create an HTTP server using the Express app
const server = http.createServer(app);
// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(server);
io.on('connection',(socket)=>{
    socket.emit('me',{socketId:socket.id});
    console.log(`Connected User:${socket.id}`);
    Users.push({socketId:socket.id})
    // diconnect method
    socket.on('disconnect',()=>{
        console.log(`User Disconnected:${socket.id}`);
        // splice method is used to remove elements from the array
        Users.splice(Users.findIndex(user=>user.socketId===socket.id),1)
    })
})
server.listen(PORT,(error)=>{
    try{
        console.log(`listening on ${PORT}`);
    }
    catch(error){
        console.error(`Error: ${error}`);
    }
});