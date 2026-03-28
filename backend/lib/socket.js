import { Server } from "socket.io";

let io;

const allowedOrigins = [
  "http://192.168.1.70:5173",
  "http://localhost:5173",
  "http://172.16.17.2:5173",
  "http://localhost:3000",
  "http://100.64.234.28:5173",
  "https://fix-link.netlify.app"
];

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const now = new Date().toISOString();
    const { userId } = socket.handshake.query || {};
    const origin = socket.handshake.headers?.origin || "unknown-origin";

    console.log(
      `[socket] Connected at ${now} | socketId=${socket.id} | origin=${origin} | userId=${userId || "none"}`
    );

    if (userId) {
      socket.join(String(userId));
      console.log(
        `[socket] Room joined at ${new Date().toISOString()} | socketId=${socket.id} | room=${String(userId)}`
      );
    } else {
      console.log(
        `[socket] Connected without userId at ${new Date().toISOString()} | socketId=${socket.id}`
      );
    }

    socket.on("disconnect", (reason) => {
      console.log(
        `[socket] Disconnected at ${new Date().toISOString()} | socketId=${socket.id} | reason=${reason}`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
