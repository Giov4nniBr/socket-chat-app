import { Button } from "@/components/ui/button";
import { api, type FriendRequestItem } from "@/lib/api";

export function FriendRequests({
  requests,
  onResolved,
}: {
  requests: FriendRequestItem[];
  onResolved: () => void;
}) {
  if (requests.length === 0) return null;

  const handleAccept = async (id: string) => {
    await api.acceptFriendRequest(id);
    onResolved();
  };

  const handleReject = async (id: string) => {
    await api.rejectFriendRequest(id);
    onResolved();
  };

  return (
    <div className="border-b p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Pedidos pendentes
      </p>
      <ul className="flex flex-col gap-2">
        {requests.map((req) => (
          <li
            key={req.id}
            className="flex items-center justify-between gap-2"
          >
            <span className="text-sm truncate">{req.sender.name}</span>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" onClick={() => handleAccept(req.id)}>
                Aceitar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(req.id)}
              >
                Recusar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}