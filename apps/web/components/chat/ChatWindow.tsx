import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { api, type FriendUser, type Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Message as MessageRow } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

export function ChatWindow({
  currentUserId,
  friend,
}: {
  currentUserId: string;
  friend: FriendUser;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const friendIdRef = useRef(friend.id);
  friendIdRef.current = friend.id;

  // carrega histórico sempre que troca de amigo
  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);

    api
      .getMessageHistory(friend.id)
      .then((history) => {
        if (!cancelled) {
          // backend retorna mais recentes primeiro; a UI quer ordem cronológica
          setMessages([...history].reverse());
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [friend.id]);

  // escuta mensagens em tempo real (uma vez só, não por amigo)
  useEffect(() => {
    function handleReceive(message: Message) {
      // só adiciona se a mensagem pertence à conversa aberta no momento
      const isCurrentConversation =
        message.senderId === friendIdRef.current ||
        message.receiverId === friendIdRef.current;

      if (isCurrentConversation) {
        setMessages((prev) => [...prev, message]);
      }
    }

    socket.on("message:receive", handleReceive);
    return () => {
      socket.off("message:receive", handleReceive);
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    socket.emit("message:send", {
      receiverId: friend.id,
      content: content.trim(),
    });

    setContent("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3">
        <p className="text-sm font-medium">{friend.name}</p>
        <p className="text-xs text-muted-foreground">{friend.email}</p>
      </div>

      <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
        <MessageScroller className="flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {loadingHistory && (
                <p className="p-3 text-sm text-muted-foreground">
                  Carregando conversa...
                </p>
              )}
              {!loadingHistory && messages.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">
                  Nenhuma mensagem ainda. Diga oi!
                </p>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <MessageScrollerItem
                    key={msg.id}
                    messageId={msg.id}
                    scrollAnchor={isMine}
                  >
                    <MessageRow align={isMine ? "end" : "start"}>
                      <Bubble
                        align={isMine ? "end" : "start"}
                        variant={isMine ? "default" : "secondary"}
                      >
                        <BubbleContent>{msg.content}</BubbleContent>
                      </Bubble>
                    </MessageRow>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>

      <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
        <Input
          placeholder="Escreva uma mensagem"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  );
}