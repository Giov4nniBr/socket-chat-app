import type { FastifyRequest, FastifyReply } from "fastify";
import { registerSchema, loginSchema } from "./user.schema.js";
import { UserService } from "./user.service.js";
import z from "zod"

export const UserController = {
  register: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).send({ error: z.treeifyError(parsed.error) });
    }

    try {
      const { headers, response } = await UserService.register(parsed.data);

      const setCookie = headers.get("set-cookie");

      if (setCookie) {
        res.header("set-cookie", setCookie);
      }

      return res.status(201).send(response);
    } catch (err) {
      return res.status(400).send({ error: "register failed" });
    }
  },

  login: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).send({ error: z.treeifyError(parsed.error) });
    }

    try {
      const { headers, response } = await UserService.login(parsed.data);

      const setCookie = headers.get("set-cookie");
      if (setCookie) {
        res.header("set-cookie", setCookie);
      }

      return res.status(200).send(response);
    } catch (err) {
      return res.status(401).send({ error: "Credenciais inválidas" });
    }
  },

  search: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const { email } = req.query as { email: string };
      if (!email) {
        return res.status(400).send({ error: "user email is required" });
      }

      const currentUser = (req as any).user;
      if (currentUser.email === email) {
        return res
          .status(400)
          .send({ error: "Você não pode adicionar a si mesmo" });
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
