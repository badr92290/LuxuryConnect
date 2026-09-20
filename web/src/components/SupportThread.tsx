import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/config";
import { api, ApiError, getToken } from "../api/client";
import { SupportMessage, SupportTicket } from "../types";
import { Button, ErrorText } from "./ui";

/**
 * Fil de discussion d'un dossier SAV : le seul endroit du service où le
 * client et l'atelier s'écrivent directement. Les messages système
 * (ouverture, relance, escalade) sont affichés en retrait, centrés, pour
 * qu'on ne les confonde pas avec une parole humaine.
 */
export function SupportThread({
  ticket,
  currentUserId,
  onTicketChange,
}: {
  ticket: SupportTicket;
  currentUserId: string;
  onTicketChange: (ticket: SupportTicket) => void;
}) {
  const [messages, setMessages] = useState<SupportMessage[]>(ticket.messages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMessages(ticket.messages), [ticket.messages]);

  useEffect(() => {
    const socket = io(API_BASE_URL, { auth: { token: getToken() } });
    socketRef.current = socket;
    socket.emit("join_support", ticket.id);
    socket.on("support_message", (message: SupportMessage) => {
      // Le serveur renvoie aussi nos propres messages : on dédoublonne.
      setMessages((list) => (list.some((m) => m.id === message.id) ? list : [...list, message]));
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticket.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const closed = ticket.status === "RESOLVED";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    try {
      const { message } = await api.post<{ message: SupportMessage }>(
        `/support/${ticket.id}/messages`,
        { content },
      );
      setMessages((list) => (list.some((m) => m.id === message.id) ? list : [...list, message]));
      setDraft("");
      if (ticket.status === "OPEN" && message.sender?.role === "PROFESSIONAL") {
        onTicketChange({ ...ticket, status: "IN_PROGRESS" });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Message non envoyé");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col">
      <ol className="flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((message) => {
          if (message.isSystem) {
            return (
              <li key={message.id} className="my-1 text-center">
                <span className="inline-block rounded-full border border-hairline bg-surfaceAlt px-4 py-1.5 text-xs leading-relaxed text-mutedDark">
                  {message.content}
                </span>
              </li>
            );
          }
          const mine = message.senderId === currentUserId;
          const author = message.sender
            ? message.sender.role === "ADMIN"
              ? "Assistance LuxuryConnect"
              : message.sender.role === "PROFESSIONAL"
                ? ticket.professional.businessName
                : `${message.sender.firstName} ${message.sender.lastName}`
            : "";
          return (
            <li key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div className="max-w-[80%]">
                {!mine && (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">
                    {author}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    mine
                      ? "bg-gold/15 text-ivory"
                      : "border border-hairline bg-surfaceAlt text-ivory"
                  }`}
                >
                  {message.content}
                </div>
                <p className="mt-1 text-[10px] text-mutedDark">
                  {new Date(message.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </li>
          );
        })}
        <div ref={bottomRef} />
      </ol>

      {closed ? (
        <p className="mt-5 rounded-xl border border-hairline bg-surfaceAlt px-4 py-3 text-center text-sm text-muted">
          Ce dossier est clos. Ouvrez-en un nouveau si le problème réapparaît.
        </p>
      ) : (
        <form onSubmit={send} className="mt-5">
          {error && <ErrorText>{error}</ErrorText>}
          <div className="flex items-end gap-2">
            <label htmlFor="support-draft" className="sr-only">
              Votre message
            </label>
            <textarea
              id="support-draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Écrivez votre message…"
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-ivory placeholder:text-mutedDark transition-colors focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40"
            />
            <Button type="submit" loading={sending} className="shrink-0">
              Envoyer
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
