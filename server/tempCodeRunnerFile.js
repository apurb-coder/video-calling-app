socket.on("disconnect", () => {
    console.log(`User Disconnected:${socket.id}`);
    // splice method is used to remove elements from the array
    Users.splice(
      Users.findIndex((user) => user.socketId === socket.id),
      1
    );
  });