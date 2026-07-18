import z from "zod";

export const emailQuerySchema = z.object({
  email: z.email(),
});
