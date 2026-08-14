import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initMessageSocket } from "./src/sockets/messageSocket.js";

const port = Number(process.env.PORT || 4000);
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

// attach io to requests
app.use((req, _res, next) => {
  req.io = io;
  next();
});

initMessageSocket(io);

server.listen(port, () => console.log(`API listening on http://localhost:${port}`));
