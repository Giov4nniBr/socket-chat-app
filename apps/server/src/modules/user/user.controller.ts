import type { FastifyRequest, FastifyReply } from "fastify";
import { registerSchema, loginSchema } from "./user.schema.js";
import { UserService } from "./user.service.js";

export const UserController = {
  register: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const result = await UserService.register(parsed.data);
      return res.status(201).send(result);
    } catch (err) {
      return res.status(400).send({ error: "register failed" });
    }
  },

  login: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const result = await UserService.login(parsed.data);
      return res.status(200).send(result);
    } catch (err) {
      return res.status(401).send({ error: "Credenciais inválidas" });
    }
  },

  search: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { email } = req.params as { email: string };

      if (email) {
        return res.status(400).send({ error: "user email is required" });
      }

      const user = await UserService.search(email);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      return res.send(user);
    } catch (err) {
      console.error("Search error:", err);
      return res.status(500).send({ error: "Internal server error" });
    }
  },
};
