import { io } from "socket.io-client";

const cookie = "better-auth.session_token=blluFoa8IHjVwXpzkpiH3Fy2ggJdlIlv.KhrRAlCDmjf6E5tK%2BS6ZAKqjl3dR9hHP4jMn6zX61TE%3D";

const socket = io("http://localhost:3333", {
  extraHeaders: {
    cookie,
  },
});

socket.on("connect", () => {
  console.log("conectado:", socket.id);

  socket.emit("message:send", {
    receiverId: "aFpBuN09e4wIjuyXS5opvZgXDIb3kiMf",
    content: "oi ana, terceira mensagem via socket",
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