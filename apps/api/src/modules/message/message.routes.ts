import type { FastifyInstance } from "fastify";
import { UserMiddleware } from "../user/user.middleware.js";
import { MessageController } from "./message.controller.js";

export async function MessageRoutes(app: FastifyInstance) {
  app.addHook("preHandler", UserMiddleware.authenticate);

  app.get("/messages/:friend", MessageController.getHistory);
}
