import { useEffect, useMemo, useState } from "react";
import {
  sendConversationMessage,
  subscribeConversationMessages,
  type MessageDoc,
} from "@/lib/professionalServices";

export function useConversation(conversationId: string) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeConversationMessages(conversationId, items => {
      setMessages(items);
      setLoading(false);
    });
    return () => unsub();
  }, [conversationId]);

  async function sendMessage(params: {
    senderId: string;
    receiverId: string;
    text: string;
  }) {
    const optimistic: MessageDoc = {
      id: `local-${Date.now()}`,
      senderId: params.senderId,
      receiverId: params.receiverId,
      text: params.text,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      read: false,
    };

    setMessages(prev => [...prev, optimistic]);
    setSending(true);
    try {
      await sendConversationMessage({
        conversationId,
        senderId: params.senderId,
        receiverId: params.receiverId,
        text: params.text,
      });
    } finally {
      setSending(false);
    }
  }

  const groupedByDate = useMemo(() => {
    const map = new Map<string, MessageDoc[]>();
    messages.forEach(item => {
      const seconds = (item.createdAt as { seconds?: number } | undefined)?.seconds;
      const date = typeof seconds === "number" ? new Date(seconds * 1000).toDateString() : "Hoje";
      const current = map.get(date) ?? [];
      current.push(item);
      map.set(date, current);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [messages]);

  return {
    messages,
    groupedByDate,
    loading,
    sending,
    sendMessage,
  };
}

