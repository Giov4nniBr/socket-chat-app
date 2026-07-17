import type { UserDTO } from "@/lib/chat.schema";
import { requestClient } from "../http/client";

export function searchUser(email: string) {
  return requestClient<UserDTO>(`/user/${encodeURIComponent(email)}`);
}
