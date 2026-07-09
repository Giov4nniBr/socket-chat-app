import { prisma } from "../../lib/auth.js";

export const MessageRepository = {
  create: async (senderId: string, receiverId: string, content: string) => {
    const message = await prisma.message.create({
      data: {
        receiverId,
        content,
        senderId,
      },
    });

    return message;
  },

  listBetweenUsers: async (
    userAId: string,
    userBId: string,
    cursor?: string,
    limit: number = 20,
  ) => {
    const result = await prisma.message.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        OR: [
          { receiverId: userAId, senderId: userBId },
          { receiverId: userBId, senderId: userAId },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return result;
  },
};
