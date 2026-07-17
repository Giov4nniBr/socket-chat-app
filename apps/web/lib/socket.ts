import { io, type Socket } from "socket.io-client";
// import "dotenv/config"

const API_URL = import.meta.env.PUBLIC_API_URL as string;

export const socket: Socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false,
});