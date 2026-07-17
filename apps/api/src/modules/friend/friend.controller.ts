import type { FastifyRequest, FastifyReply } from "fastify";
import { FriendService } from "./friend.service.js";
import { sendRequest } from "./friend.schema.js";
import z from "zod";

export const FriendController = {
  sendRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = sendRequest.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).send({ error: z.treeifyError(parsed.error) });
    }

    const senderId = (req as any).user.id;

    try {
      const result = await FriendService.sendRequest(
        senderId,
        parsed.data.receiverEmail,
      );

      return res.status(201).send(result);
    } catch (error: any) {
      const errorMessage = error.message; //

      switch (errorMessage) {
        case "user not found":
          return res.status(404).send({ error: errorMessage });

        case "the user cannot add themselves":
          return res.status(400).send({ error: errorMessage });

        case "you are already friends":
        case "there is already a pending request":
          return res.status(409).send({ error: errorMessage });

        default:
          return res.status(500).send({ error: "Internal server error" });
      }
    }
  },

  acceptRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = req.params as { id: string };

    const currentUserId = (req as any).user.id;

    try {
      const result = await FriendService.acceptRequest(id, currentUserId);
      return res.status(200).send(result);
    } catch (error: any) {
      const errorMessage = error.message;

      if (errorMessage === "request not found") {
        return res.status(404).send({ error: errorMessage });
      }
      if (
        errorMessage === "you do not have permission to respond to this request"
      ) {
        return res.status(403).send({ error: errorMessage });
      }
      if (errorMessage.startsWith("request already")) {
        return res.status(409).send({ error: errorMessage });
      }

      return res.status(500).send({ error: "Internal server error" });
    }
  },

  rejectRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const { id } = req.params as { id: string };

    const currentUserId = (req as any).user.id;

    try {
      const result = await FriendService.rejectRequest(id, currentUserId);
      return res.status(200).send(result);
    } catch (error: any) {
      const errorMessage = error.message;

      if (errorMessage === "request not found") {
        return res.status(404).send({ error: errorMessage });
      }
      if (
        errorMessage === "you do not have permission to respond to this request"
      ) {
        return res.status(403).send({ error: errorMessage });
      }
      if (errorMessage.startsWith("request already")) {
        return res.status(409).send({ error: errorMessage });
      }

      return res.status(500).send({ error: "Internal server error" });
    }
  },

  listFriend: async (req: FastifyRequest, res: FastifyReply) => {
    const userId = (req as any).user.id;

    const result = await FriendService.listFriends(userId);

    return res.status(200).send(result);
  },

  listPendingRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const userId = (req as any).user.id;

    const result = await FriendService.listPendingRequests(userId);

    return res.status(200).send(result);
  },
};
