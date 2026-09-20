import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { SERVICE_LABELS, ServiceType } from "../../types";
import { Badge, Button, Card, EmptyState, SkeletonList } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  serviceType: ServiceType | null;
  message: string | null;
  handledAt: string | null;
  createdAt: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get<{ leads: Lead[] }>("/contact")
      .then((data) => setLeads(data.leads))
      .finally(() => setLoading(false));
  }, []);

  async function toggleHandled(lead: Lead) {
    setBusyId(lead.id);
    try {
      const { lead: updated } = await api.patch<{ lead: Lead }>(`/contact/${lead.id}`, {
        handled: !lead.handledAt,
      });
      setLeads((list) => list.map((l) => (l.id === lead.id ? updated : l)));
      toast(updated.handledAt ? "Demande marquée comme traitée" : "Demande rouverte", "success");
    } catch {
      toast("Impossible de mettre à jour cette demande", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <SkeletonList />;

  const pending = leads.filter((l) => !l.handledAt).length;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ivory">Demandes du site</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        {pending === 0
          ? "Toutes les demandes reçues depuis le formulaire de contact sont traitées."
          : `${pending} demande${pending > 1 ? "s" : ""} en attente sur ${leads.length}.`}
      </p>

      {leads.length === 0 && <EmptyState message="Aucune demande reçue pour le moment." />}

      <div className="flex flex-col gap-3">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ivory">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="mt-1 text-sm text-muted">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-gold underline underline-offset-2"
                  >
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <>
                      {" · "}
                      <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="text-ivory">
                        {lead.phone}
                      </a>
                    </>
                  )}
                  {lead.city ? ` · ${lead.city}` : ""}
                </p>
              </div>
              <Badge
                label={lead.handledAt ? "Traitée" : "À traiter"}
                tone={lead.handledAt ? "success" : "primary"}
              />
            </div>

            {lead.serviceType && (
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">
                {SERVICE_LABELS[lead.serviceType]}
              </p>
            )}
            {lead.message && (
              <p className="mt-2 text-sm leading-relaxed text-ivory/90">{lead.message}</p>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-mutedDark">
                {new Date(lead.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <Button
                variant="secondary"
                onClick={() => toggleHandled(lead)}
                disabled={busyId === lead.id}
              >
                {lead.handledAt ? "Rouvrir" : "Marquer comme traitée"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
