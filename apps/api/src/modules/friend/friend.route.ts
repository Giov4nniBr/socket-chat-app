import type { FastifyInstance } from "fastify";
import { FriendController } from "./friend.controller.js";
import { UserMiddleware } from "../user/user.middleware.js";

export async function FriendRoutes(app: FastifyInstance) {
  app.addHook("preHandler", UserMiddleware.authenticate);

  app.post("/friends/request", FriendController.sendRequest);
  app.post("/friends/:id/accept", FriendController.acceptRequest);
  app.post("/friends/:id/reject", FriendController.rejectRequest);
  app.get("/friends", FriendController.listFriend);
  app.get("/friends/requests", FriendController.listPendingRequest);
}
