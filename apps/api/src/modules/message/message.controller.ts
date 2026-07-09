import type { FastifyRequest, FastifyReply } from "fastify";
import { MessageService } from "./message.service.js";
import { messageHistorySchema } from "./message.schema.js";
import z from "zod";

export const MessageController = {
  getHistory: async (req: FastifyRequest, res: FastifyReply) => {
    const { friend: friendId } = req.params as { friend: string };
    const currentUserId = (req as any).user.id;

    const parsed = messageHistorySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).send({ error: z.treeifyError(parsed.error) });
    }

    try {
      const result = await MessageService.listHistory(
        currentUserId,
        friendId,
        parsed.data.cursor,
        parsed.data.limit ?? 20,
      );
      return res.status(200).send(result);
    } catch (error: any) {
      const errorMessage = error.message;

      switch (errorMessage) {
        case "you are not friends with this user":
          return res.status(403).send({ error: errorMessage });

        default:
          return res.status(500).send({ error: "Internal server error" });
      }
    }
  },
};
