const API_URL = import.meta.env.PUBLIC_API_URL as string;

type FriendUser = {
  id: string;
  name: string;
  email: string;
};

type FriendRequestItem = {
  id: string;
  createdAt: string;
  sender: FriendUser;
};

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Erro na requisição (${res.status})`);
  }

  // algumas rotas podem não ter corpo (204, por exemplo)
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  searchUser: (email: string) =>
    request<FriendUser>(`/user/${encodeURIComponent(email)}`),

  sendFriendRequest: (receiverEmail: string) =>
    request<{ id: string }>("/friends/request", {
      method: "POST",
      body: JSON.stringify({ receiverEmail }),
    }),

  acceptFriendRequest: (requestId: string) =>
    request<void>(`/friends/${requestId}/accept`, { method: "POST" }),

  rejectFriendRequest: (requestId: string) =>
    request<void>(`/friends/${requestId}/reject`, { method: "POST" }),

  listFriends: () => request<FriendUser[]>("/friends"),

  listPendingRequests: () =>
    request<FriendRequestItem[]>("/friends/requests"),

  getMessageHistory: (friendId: string, cursor?: string, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    params.set("limit", String(limit));
    return request<Message[]>(`/messages/${friendId}?${params.toString()}`);
  },
};

export type { FriendUser, FriendRequestItem, Message };