import z from "zod";

export const currentUserSchema = z.object({
  id: z.cuid2(),
  name: z.string().min(2).max(32),
  email: z.email(),
});

export const friendUserSchema = z.object({
  id: z.cuid2(),
  name: z.string().min(2).max(32),
  email: z.email(),
})

export const friendRequestItem = z.object({
  id: z.cuid2(),
  createdAt: z.string(),
  sender: friendUserSchema,
})

export const messageSchema = z.object({
  id: z.cuid2(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  createdAt: z.string()
})

