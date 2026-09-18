import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { api, getToken } from "../../api/client";
import { API_BASE_URL } from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { Message } from "../../types";
import { BackLink, Button, Input } from "../../components/ui";

export default function ChatPage({ basePath }: { basePath: string }) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    api.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`).then((data) => {
      setMessages(data.messages);
    });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const socket = io(API_BASE_URL, { auth: { token: getToken() } });
    socketRef.current = socket;
    socket.emit("join_conversation", conversationId);
    socket.on("new_message", (message: Message) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
    return () => {
      socket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!text.trim() || !conversationId) return;
    socketRef.current?.emit("send_message", { conversationId, content: text.trim() });
    setText("");
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-3rem)]">
      <BackLink label="Retour aux messages" onClick={() => navigate(`${basePath}/messages`)} />
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-primary text-background" : "bg-surfaceAlt text-white"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <div className="flex-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez un message..."
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="mb-0"
          />
        </div>
        <Button onClick={send}>Envoyer</Button>
      </div>
    </div>
  );
}
