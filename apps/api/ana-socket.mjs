import { io } from "socket.io-client";

const cookie = "better-auth.session_token=seDcW0xTavv3bq6UahPoUNDTF8fEI1ss.yDU%2BzNfF3%2BA9QUj1fxp4NNVws8gdj0qbSUSqkTfx8AE%3D";

const socket = io("http://localhost:3333", {
  extraHeaders: {
    cookie,
  },
});

socket.on("connect", () => {
  console.log("conectado:", socket.id);

  socket.emit("message:send", {
    receiverId: "pN8orSTm0d6ytrmWlrSD0RBUtY4dBsRb",
    content: "oi bruno, segunda mensagem via socket",
  });
});

socket.on("message:receive", (msg) => {
  console.log("mensagem recebida:", msg);
});

socket.on("message:error", (err) => {
  console.log("erro:", err);
});

socket.on("connect_error", (err) => {
  console.log("erro de conexão:", err.message);
});