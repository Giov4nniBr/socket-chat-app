import { prisma } from "../../lib/auth.js";

export const UserRepository = {
  search: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        email: true,
      },
    });
    return user;
  },
};
