import type { FastifyRequest, FastifyReply } from "fastify";
import { registerSchema, loginSchema } from "./user.schema.js";
import { UserService } from "./user.service.js";
import { emailQuerySchema } from "../../shared/utils/query.params.js";
import { AppError } from "../../shared/errors/AppError.js";

export const UserController = {
  register: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw AppError.badRequest("invalid informations");
    }

    const { headers, response } = await UserService.register(parsed.data);

    const setCookie = headers.get("set-cookie");

    if (setCookie) {
      res.header("set-cookie", setCookie);
    }

    return res.status(201).send(response);
  },

  login: async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw AppError.badRequest("invalid informations");
    }

    const { headers, response } = await UserService.login(parsed.data);

    const setCookie = headers.get("set-cookie");

    if (setCookie) {
      res.header("set-cookie", setCookie);
    }

    return res.status(200).send(response);
  },

  search: async (req: FastifyRequest, res: FastifyReply) => {
    const parsedEmail = emailQuerySchema.safeParse(req.query);

    if (!parsedEmail.success) {
      throw AppError.badRequest("Invalid request email");
    }

    const { email } = parsedEmail.data

    const currentUser = req.user;

    if (currentUser.email === email) {
      throw AppError.badRequest("you cannot add yourself");
    }

    const user = await UserService.search(email);

    if (!user) {
      throw AppError.notFound("user not found")
    }

    return res.send(user);
  },
};
