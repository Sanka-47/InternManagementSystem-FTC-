export function initMessageSocket(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a room for admin <-> user chat
    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Listen for sending messages
    socket.on("sendMessage", (message) => {
      const { roomId } = message;
      // Emit to all in the room except sender
      socket.to(roomId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
