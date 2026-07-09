import { auth } from "../../lib/auth.js";
import type { FastifyRequest, FastifyReply } from "fastify";

export const UserMiddleware = {
  authenticate: async (req: FastifyRequest, res: FastifyReply) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).send({ error: "Unauthorized" });
      }

      (req as any).user = session.user;
    } catch (error) {
      return res.status(401).send({ error: "Authentication failed" });
    }
  },
};
