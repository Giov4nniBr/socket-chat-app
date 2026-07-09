import z from "zod";

export const createMessageSchema = z.object({
  receiverId: z.cuid(),
  content: z.string().min(1).max(2048),
});

export const messageHistorySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional()
});

export type createMessageDTO = z.infer<typeof createMessageSchema>;
export type messageHistoryDTO = z.infer<typeof messageHistorySchema>;
