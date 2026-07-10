import { useCallback, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { api, type FriendUser, type FriendRequestItem } from "@/lib/api";
import { FriendList } from "./chat/FriendList";
import { FriendRequests } from "./chat/FriendRequests";
import { AddFriend } from "./chat/AddFriend";
import { ChatWindow } from "./chat/ChatWindow";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export function ChatApp({ user }: { user: CurrentUser }) {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<
    FriendRequestItem[]
  >([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(
    null,
  );

  const loadFriends = useCallback(() => {
    api.listFriends().then(setFriends).catch(console.error);
  }, []);

  const loadPendingRequests = useCallback(() => {
    api.listPendingRequests().then(setPendingRequests).catch(console.error);
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