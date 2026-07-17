import { useCallback, useEffect, useState } from "react";
import { listFriends, listPendingRequests } from "@/lib/api/friends";
import { socket } from "@/lib/socket";
import { FriendRequests } from "./chat/FriendRequests";
import { ChatWindow } from "./chat/ChatWindow";
import { FriendList } from "./chat/FriendList";
import { AddFriend } from "./chat/AddFriend";
import type { FriendRequestDTO } from "@/lib/chat.schema";
import type { UserDTO } from "@/lib/chat.schema";


export function ChatApp({ user }: { user: UserDTO }) {
  const [friends, setFriends] = useState<UserDTO[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequestDTO[]>(
    [],
  );
  const [selectedFriend, setSelectedFriend] = useState<UserDTO | null>(null);

  const loadFriends = useCallback(() => {
    listFriends().then(setFriends).catch(console.error);
  }, []);

  const loadPendingRequests = useCallback(() => {
    listPendingRequests().then(setPendingRequests).catch(console.error);
  }, []);

  // conecta o socket só depois que a sessão já foi confirmada (essa página
  // só renderiza pra usuário autenticado, então é seguro conectar aqui)
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [loadFriends, loadPendingRequests]);

  return (
    <div className="flex h-svh">
      <aside className="w-72 border-r flex flex-col">
        <AddFriend onSent={loadPendingRequests} />
        <FriendRequests
          requests={pendingRequests}
          onResolved={() => {
            loadPendingRequests();
            loadFriends();
          }}
        />
        <FriendList
          friends={friends}
          selectedFriendId={selectedFriend?.id ?? null}
          onSelect={setSelectedFriend}
        />
      </aside>

      <main className="flex-1">
        {selectedFriend ? (
          <ChatWindow currentUserId={user.id} friend={selectedFriend} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Selecione um amigo para começar a conversar
          </div>
        )}
      </main>
    </div>
  );
}
