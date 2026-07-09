import type { RequestStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/auth.js";

export const FriendRepository = {
  createFriendRequest: async (senderId: string, receiverId: string) => {
    const result = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });
    return result;
  },

  findPendingRequestBetween: async (userAId: string, userBId: string) => {
    const result = await prisma.friendRequest.findFirst({
      where: {
        status: "PENDING",
        OR: [
          { senderId: userAId, receiverId: userBId },
          { senderId: userBId, receiverId: userAId },
        ],
      },
    });
    return result;
  },

  findFriendshipBetween: async (userAId: string, userBId: string) => {
    const result = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });
    return result;
  },

  findRequestById: async (id: string) => {
    const result = await prisma.friendRequest.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
    return result;
  },

  rejectRequest: async (id: string) => {
    const result = await prisma.friendRequest.update({
      where: { id },
      data: { status: "REJECTED" as RequestStatus },
    });
    return result;
  },

  acceptRequest: async (requestId: string, userAId: string, userBId: string) => {
    const result = await prisma.$transaction([
      prisma.friendship.create({
        data: { userAId, userBId },
      }),
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" as RequestStatus },
      }),
    ]);
    return result;
  },

  listFriendships: async (userId: string) => {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      select: {
        userAId: true,
        userA: { select: { id: true, name: true, email: true } },
        userB: { select: { id: true, name: true, email: true } },
      },
    });

    return friendships.map((f) =>
      f.userAId === userId ? f.userB : f.userA
    );
  },

  listPendingRequestsForUser: async (userId: string) => {
    const result = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      select: {
        id: true,
        createdAt: true,
        sender: {
          select: { id: true, email: true, name: true },
        },
      },
    });
    return result;
  },
};