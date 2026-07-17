import z from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(32),
  email: z.email(),
});

export const friendRequestSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  sender: userSchema,
});

export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export type UserDTO = z.infer<typeof userSchema>;
export type FriendRequestDTO = z.infer<typeof friendRequestSchema>;
export type MessageDTO = z.infer<typeof messageSchema>;
