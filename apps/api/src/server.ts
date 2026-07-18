import { app } from "./app.js";
import fastifyCors from "@fastify/cors";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { UserRoutes } from "./modules/user/user.routes.js";
import { FriendRoutes } from "./modules/friend/friend.routes.js";
import { setupSocket } from "./plugins/socket.js";
import { MessageRoutes } from "./modules/message/message.routes.js";
import { AppError } from "./shared/errors/AppError.js";

app.register(fastifyCors, {
  origin: process.env.CLIENT_URL!,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
});

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const headers = fromNodeHeaders(request.headers);
      headers.delete("content-length");
      headers.delete("host");

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
      // tratamento próprio, não usa AppError pra não vazar detalhes do handler do better-auth
    } catch (error) {
      return reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

app.register(UserRoutes);
app.register(FriendRoutes);
app.register(MessageRoutes);

setupSocket(app);

const port = Number(process.env.PORT!);

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on port ${port}`);
});
