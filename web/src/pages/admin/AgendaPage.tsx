import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Contact, QUOTE_REQUEST_STATUS_LABELS, SERVICE_LABELS } from "../../types";
import { Badge, Card, EmptyState, Input, Spinner } from "../../components/ui";
import { IconPhone, IconMail } from "../../components/icons";

const TONE: Record<string, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "danger",
  FORWARDED: "muted",
  QUOTED: "primary",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "muted",
  CANCELLED: "muted",
};

export default function AgendaPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      const data = await api.get<{ contacts: Contact[] }>(`/admin/contacts${qs}`);
      setContacts(data.contacts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => load(query), 250);
    return () => clearTimeout(handle);
  }, [query, load]);

  const groups = useMemo(() => {
    const map = new Map<string, Contact[]>();
    for (const c of contacts) {
      const letter = (c.lastName || c.firstName || "#").trim().charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [contacts]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-3xl text-ivory tracking-tight">Agenda clients</h1>
      <p className="mb-6 text-sm text-muted">
        Carnet de contacts privé : coordonnées et objet de chaque demande, visible uniquement par vous.
      </p>

      <Input
        placeholder="Rechercher un nom, un téléphone, un email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2"
      />

      {loading ? (
        <Spinner />
      ) : contacts.length === 0 ? (
        <EmptyState message="Aucun contact ne correspond à votre recherche." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([letter, group]) => (
            <div key={letter}>
              <div className="sticky top-0 z-[1] -mx-1 mb-2 bg-background/95 px-1 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {letter}
              </div>
              <div className="flex flex-col gap-3">
                {group.map((c) => (
                  <Card key={c.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg text-ivory">
                        {c.firstName} {c.lastName}
                      </p>
                      <span className="text-xs text-mutedDark">
                        Client depuis {new Date(c.clientSince).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-gold hover:text-gold-200">
                          <IconPhone className="h-3.5 w-3.5" /> {c.phone}
                        </a>
                      )}
                      <span className="flex items-center gap-1.5">
                        <IconMail className="h-3.5 w-3.5" /> {c.email}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-hairline pt-4">
                      {c.requests.length === 0 ? (
                        <p className="text-sm text-muted">Aucune demande de devis pour le moment.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {c.requests.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => navigate(`/admin/requests/${r.id}`)}
                              className="flex cursor-pointer items-center justify-between rounded-xl border border-hairline px-4 py-3 text-sm transition-colors hover:border-gold/40"
                            >
                              <div>
                                <p className="font-medium">
                                  {SERVICE_LABELS[r.serviceType]} · {r.vehicleMake} {r.vehicleModel}
                                  {r.vehicleYear ? ` (${r.vehicleYear})` : ""}
                                </p>
                                <p className="text-xs text-muted">
                                  {r.city ? `${r.city} · ` : ""}
                                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                              <Badge label={QUOTE_REQUEST_STATUS_LABELS[r.status]} tone={TONE[r.status]} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
