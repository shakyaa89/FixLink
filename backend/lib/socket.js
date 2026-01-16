import { Server } from "socket.io";

let io;

const allowedOrigins = [
  "http://192.168.1.70:5173",
  "http://localhost:5173",
  "http://192.168.1.70:3000",
  "http://localhost:3000",
  "http://100.64.234.28:5173",
];

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query || {};
    if (userId) {
      socket.join(String(userId));
    }
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
