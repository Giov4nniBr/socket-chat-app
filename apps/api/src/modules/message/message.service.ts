import { FriendRepository } from "../friend/friend.repository.js";
import { MessageRepository } from "./message.repository.js";

export const MessageService = {
  send: async (senderId: string, receiverId: string, content: string) => {
    const isFriends = await FriendRepository.findFriendshipBetween(
      senderId,
      receiverId,
    );

    if (!isFriends) {
      throw new Error("you are not friends with this user");
    }

    const message = await MessageRepository.create(
      senderId,
      receiverId,
      content,
    );

    return message;
  },

  listHistory: async (
    currentUserId: string,
    friendId: string,
    cursor?: string,
    limit?: number,
  ) => {
    const isFriends = await FriendRepository.findFriendshipBetween(
      currentUserId,
      friendId,
    );

    if (!isFriends) {
      throw new Error("you are not friends with this user");
    }

    const history = await MessageRepository.listBetweenUsers(
      currentUserId,
      friendId,
      cursor,
      limit,
    );

    return history;
  },
};
