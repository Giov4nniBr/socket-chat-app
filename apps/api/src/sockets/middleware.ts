import { auth } from "../lib/auth.js";
import type { Socket } from "socket.io";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const headers = new Headers();
  if (socket.handshake.headers.cookie) {
    headers.set("cookie", socket.handshake.headers.cookie);
  }

  try {
    const session = await auth.api.getSession({ headers });

    if (!session) {
      return next(new Error("unauthorized"));
    }

    socket.data.user = session.user;
    next();
  } catch (error) {
    next(new Error("unauthorized"));
  }
};
