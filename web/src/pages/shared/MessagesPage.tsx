import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Conversation } from "../../types";
import { Card, EmptyState, Spinner } from "../../components/ui";

export default function MessagesPage({ basePath }: { basePath: string }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ conversations: Conversation[] }>("/conversations");
      setConversations(data.conversations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function otherParticipant(c: Conversation) {
    return c.participantA?.id === user?.id ? c.participantB : c.participantA;
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>
      {conversations.length === 0 && <EmptyState message="Aucune conversation pour le moment." />}
      <div className="flex flex-col gap-3">
        {conversations.map((c) => {
          const other = otherParticipant(c);
          const last = c.messages?.[0];
          return (
            <Card
              key={c.id}
              className="cursor-pointer hover:border-primary/40"
              onClick={() => navigate(`${basePath}/messages/${c.id}`)}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {other?.firstName} {other?.lastName}
                  {other?.role === "ADMIN" && <span className="ml-2 text-xs text-muted">(Intermédiaire)</span>}
                </p>
              </div>
              {last && <p className="mt-1 truncate text-sm text-muted">{last.content}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
