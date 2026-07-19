import type { FastifyRequest, FastifyReply } from "fastify";
import { FriendService } from "./friend.service.js";
import { sendRequest } from "./friend.schema.js";
import { AppError } from "../../shared/errors/AppError.js";
import { idParamsSchema } from "../../shared/utils/params.schema.js";

export const FriendController = {
  sendRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = sendRequest.safeParse(req.body);

    if (!parsed.success) {
      throw AppError.badRequest("invalid request body");
    }

    const senderId = req.user.id;

    const result = await FriendService.sendRequest(
      senderId,
      parsed.data.receiverEmail,
    );
    return res.status(201).send(result);
  },

  acceptRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const parsedParams = idParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw AppError.badRequest("invalid request id");
    }

    const { id } = parsedParams.data;
    const currentUserId = req.user.id;

    const result = await FriendService.acceptRequest(id, currentUserId);

    return res.status(200).send(result);
  },

  rejectRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const parsedParams = idParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw AppError.badRequest("invalid request id");
    }

    const { id } = parsedParams.data;
    const currentUserId = req.user.id;

    const result = await FriendService.rejectRequest(id, currentUserId);
    return res.status(200).send(result);
  },

  listFriend: async (req: FastifyRequest, res: FastifyReply) => {
    const userId = req.user.id;

    const result = await FriendService.listFriends(userId);

    return res.status(200).send(result);
  },

  listPendingRequest: async (req: FastifyRequest, res: FastifyReply) => {
    const userId = req.user.id;

    const result = await FriendService.listPendingRequests(userId);

    return res.status(200).send(result);
  },
};
