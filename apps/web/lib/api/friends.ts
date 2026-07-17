import type { UserDTO, FriendRequestDTO } from "@/lib/chat.schema";
import { requestClient } from "../http/client";

export function sendFriendRequest(receiverEmail: string) {
  return requestClient<{ id: string }>("/friends/request", {
    method: "POST",
    body: JSON.stringify({ receiverEmail }),
  });
}

export function acceptFriendRequest(requestId: string) {
  return requestClient<void>(`/friends/${requestId}/accept`, {
    method: "POST",
  });
}

export function rejectFriendRequest(requestId: string) {
  return requestClient<void>(`/friends/${requestId}/reject`, {
    method: "POST",
  });
}

export function listFriends() {
  return requestClient<UserDTO[]>("/friends");
}

export function listPendingRequests() {
  return requestClient<FriendRequestDTO[]>("/friends/requests");
}
