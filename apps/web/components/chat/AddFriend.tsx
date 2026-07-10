import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export function AddFriend({ onSent }: { onSent?: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      await api.sendFriendRequest(email.trim());
      setFeedback({ type: "success", message: "Pedido enviado" });
      setEmail("");
      onSent?.();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao enviar pedido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 border-b">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@amigo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "Adicionar"}
        </Button>
      </div>
      {feedback && (
        <p
          className={
            feedback.type === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}