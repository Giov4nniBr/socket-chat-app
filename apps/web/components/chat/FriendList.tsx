import type { FriendUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export function FriendList({
  friends,
  selectedFriendId,
  onSelect,
}: {
  friends: FriendUser[];
  selectedFriendId: string | null;
  onSelect: (friend: FriendUser) => void;
}) {
  if (friends.length === 0) {
    return (
      <p className="p-3 text-sm text-muted-foreground">
        Você ainda não tem amigos adicionados.
      </p>
    );
  }

  return (
    <ul className="flex flex-col overflow-y-auto">
      {friends.map((friend) => (
        <li key={friend.id}>
          <button
            onClick={() => onSelect(friend)}
            className={cn(
              "w-full text-left px-3 py-2 hover:bg-muted transition-colors",
              selectedFriendId === friend.id && "bg-muted",
            )}
          >
            <p className="text-sm font-medium truncate">{friend.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {friend.email}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}