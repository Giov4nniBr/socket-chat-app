import type { FastifyInstance } from "fastify";
import { UserController } from "./user.controller.js";
import { UserMiddleware } from "./user.middleware.js";

export async function UserRoutes(app: FastifyInstance) {
  app.post("/auth/register", UserController.register);
  app.post("/auth/login", UserController.login);
  app.get("/user", { preHandler: UserMiddleware.authenticate }, UserController.search);
}
