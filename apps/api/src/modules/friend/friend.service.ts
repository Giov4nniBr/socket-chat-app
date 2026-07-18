import { UserRepository } from "../user/user.repository.js";
import { FriendRepository } from "./friend.repository.js";
import { AppError } from "../../shared/errors/AppError.js";

const getPendingRequestOrThrow = async (
  requestId: string,
  currentUserId: string,
) => {
  const request = await FriendRepository.findRequestById(requestId);

  if (!request) throw AppError.notFound("request not found");
  if (request.receiverId !== currentUserId) {
    throw AppError.unauthorized(
      "you do not have permission to respond to this request",
    );
  }
  if (request.status !== "PENDING") {
    throw AppError.conflict(`request already ${request.status.toLowerCase()}`);
  }

  return request;
};

export const FriendService = {
  sendRequest: async (senderId: string, receiverEmail: string) => {
    const user = await UserRepository.search(receiverEmail);

    if (!user) {
      throw AppError.notFound("user not found");
    }

    if (senderId === user.id) {
      throw AppError.conflict("the user cannot add themselves");
    }

    if (await FriendRepository.findFriendshipBetween(senderId, user.id)) {
      throw AppError.conflict("you are already friends");
    }

    if (await FriendRepository.findPendingRequestBetween(senderId, user.id)) {
      throw AppError.badRequest("there is already a pending request");
    }

    return await FriendRepository.createFriendRequest(senderId, user.id);
  },

  acceptRequest: async (requestId: string, currentUserId: string) => {
    const request = await getPendingRequestOrThrow(requestId, currentUserId);
    return FriendRepository.acceptRequest(
      requestId,
      request.senderId,
      request.receiverId,
    );
  },

  rejectRequest: async (requestId: string, currentUserId: string) => {
    await getPendingRequestOrThrow(requestId, currentUserId);
    return FriendRepository.rejectRequest(requestId);
  },

  listPendingRequests: async (userId: string) => {
    return FriendRepository.listPendingRequestsForUser(userId);
  },

  listFriends: async (userId: string) => {
    return await FriendRepository.listFriendships(userId);
  },
};
