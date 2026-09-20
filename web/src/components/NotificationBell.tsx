import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { IconBell } from "./icons";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

const POLL_INTERVAL_MS = 45_000;

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} j`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: Notification[]; unreadCount: number }>("/notifications");
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      // Silencieux : la cloche ne doit jamais casser la navigation.
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function openNotification(notification: Notification) {
    setOpen(false);
    if (!notification.readAt) {
      await api.post(`/notifications/${notification.id}/read`);
      load();
    }
    if (notification.link) navigate(notification.link);
  }

  async function markAllRead() {
    await api.post("/notifications/read-all");
    load();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surfaceAlt hover:text-ivory"
        aria-label={unread > 0 ? `Notifications, ${unread} non lues` : "Notifications"}
        aria-expanded={open}
      >
        <IconBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Ancré à droite sous l'en-tête mobile, ouvert vers la droite depuis la barre latérale. */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 animate-fade-in-up overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/95 shadow-glass backdrop-blur-xl md:left-0 md:right-auto">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-gold transition-colors hover:text-gold-200">
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-mutedDark">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-hairline px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surfaceAlt ${
                    n.readAt ? "" : "bg-gold/[0.04]"
                  }`}
                >
                  <div className="flex w-full items-center gap-2">
                    {!n.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                    <span className="flex-1 text-sm font-semibold text-ivory">{n.title}</span>
                  </div>
                  {n.body && <span className="text-xs text-muted">{n.body}</span>}
                  <span className="text-[11px] text-mutedDark">{timeAgo(n.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
