import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { socketAuthMiddleware } from "../sockets/middleware.js";
import { registerChatHandlers } from "../sockets/chat.handler.js";
import "dotenv/config"

export function setupSocket(app: FastifyInstance) {
  const io = new Server(app.server, {
    cors: {
      origin: process.env.CLIENT_URL!,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    registerChatHandlers(socket, io);
  });

  app.decorate("io", io);

  return io;
}