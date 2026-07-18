import type { FastifyRequest, FastifyReply } from "fastify";
import { MessageService } from "./message.service.js";
import { friendParamSchema, messageHistorySchema } from "./message.schema.js";
import { AppError } from "../../shared/errors/AppError.js";

export const MessageController = {
  getHistory: async (req: FastifyRequest, res: FastifyReply) => {
    const parsedQuery = messageHistorySchema.safeParse(req.query);
    const parsedParams = friendParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw AppError.badRequest("Invalid friend id");
    }
    if (!parsedQuery.success) {
      throw AppError.badRequest("Invalid query parameters");
    }

    const { friend: friendId } = parsedParams.data;
    const { cursor, limit } = parsedQuery.data;
    const currentUserId = req.user.id;

    const result = await MessageService.listHistory(
      currentUserId,
      friendId,
      cursor,
      limit ?? 20,
    );

    return res.status(200).send(result);
  },
};
