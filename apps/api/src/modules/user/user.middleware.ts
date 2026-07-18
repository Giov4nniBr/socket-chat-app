import { auth } from "../../lib/auth.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../shared/errors/AppError.js";

export const UserMiddleware = {
  authenticate: async (req: FastifyRequest, res: FastifyReply) => {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      throw AppError.unauthorized("Unauthorized");
    }

    req.user = session.user;
  },
};
