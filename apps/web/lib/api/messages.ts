import type { MessageDTO } from "@/lib/chat.schema";
import { requestClient } from "../http/client";

export function getMessageHistory(
  friendId: string,
  cursor?: string,
  limit = 20,
) {
  const params = new URLSearchParams();

  if (cursor) {
    params.set("cursor", cursor);
  }
  params.set("limit", String(limit));

  return requestClient<MessageDTO[]>(
    `/messages/${friendId}?${params.toString()}`,
  );
}
