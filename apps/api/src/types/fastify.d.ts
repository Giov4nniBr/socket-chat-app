import fastify from "fastify";
import type { auth } from "../lib/auth.js";

type SessionUser = typeof auth.$Infer.Session.user;

declare module "fastify" {
  interface FastifyRequest {
    user: SessionUser
  }
}
