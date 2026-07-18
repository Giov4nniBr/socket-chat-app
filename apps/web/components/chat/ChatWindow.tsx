import React, { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import type { UserDTO } from "@/lib/chat.schema";
import type { MessageDTO } from "@/lib/chat.schema";
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
import { getMessageHistory } from "@/lib/api/messages";

const LOAD_MORE_THRESHOLD_PX = 80

export function ChatWindow({
  currentUserId,
  friend,
}: {
  currentUserId: string;
  friend: UserDTO;
}) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [content, setContent] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const friendIdRef = useRef(friend.id);
  friendIdRef.current = friend.id;

  const cursorRef = useRef<string | undefined>(undefined)

  const isFetchingMoreRef = useRef(false)
  // carrega histórico sempre que troca de amigo
  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    cursorRef.current = undefined

    getMessageHistory(friend.id)
      .then(({items, hasMore: more}) => {
        if (cancelled) return

        const chronological = [...items].reverse()
        setMessages(chronological)
        setHasMore(more)
        cursorRef.current = items.at(-1)?.id
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [friend.id]);

  // escuta mensagens em tempo real (uma vez só, não por amigo)
  useEffect(() => {
    function handleReceive(message: MessageDTO) {
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


  const loadOlderMessages = async () => {
    if (isFetchingMoreRef.current || !hasMore || !cursorRef.current) return

    isFetchingMoreRef.current = true
    setLoadingMore(true)

    try {
      const { items, hasMore: more} = await getMessageHistory(friend.id, cursorRef.current)

      if (items.length > 0) {
        const chronological = [...items].reverse()

        setMessages((prev) => [...chronological, ...prev])
        cursorRef.current = items.at(-1)?.id
      }

      setHasMore(more)
    } finally {
      isFetchingMoreRef.current = false
      setLoadingMore(false)
    }
  }

  const handleViewportScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop <= LOAD_MORE_THRESHOLD_PX) {
      void loadOlderMessages()
    }
  }

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
          <MessageScrollerViewport onScroll={handleViewportScroll}>
            <MessageScrollerContent>
              {loadingMore && (
                <p className="p-3 text-sm text-muted-foreground">
                  Carregando mensagens antigas...
                </p>
              )}
              {loadingHistory && (
                <p className="p-3 text-sm text-muted-foreground">
                  carregando conversa...
                </p>
              )}
              {!loadingHistory && messages.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">
                  nenhuma mensagem ainda. diga oi
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
