import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
/*import pg from "pg";
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/chatdb?schema=public"
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
trustedOrigins: [process.env.CLIENT_URL || "http://localhost:4321"],
export const prisma = new PrismaClient({ adapter });*/

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BASE_URL!,
  trustedOrigins: [process.env.CLIENT_URL!],
});
