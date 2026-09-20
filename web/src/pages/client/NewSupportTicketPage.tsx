import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Booking, SUPPORT_REASONS, SUPPORT_REASON_LABELS, SupportTicketReason } from "../../types";
import {
  BackLink,
  Button,
  Card,
  ErrorText,
  Input,
  SectionLabel,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";
import { PhotoPicker } from "../../components/PhotoPicker";

export default function NewSupportTicketPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<SupportTicketReason>("DEFECT");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<{ bookings: Booking[] }>("/bookings")
      .then((data) => setBooking(data.bookings.find((b) => b.id === bookingId) ?? null))
      .finally(() => setLoading(false));
  }, [bookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: { subject?: string; message?: string } = {};
    if (subject.trim().length < 4) found.subject = "Résumez l'objet en quelques mots.";
    if (message.trim().length < 10) found.message = "Détaillez un peu pour que l'atelier comprenne.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const { ticket } = await api.post<{ ticket: { id: string } }>("/support", {
        bookingId,
        reason,
        subject: subject.trim(),
        message: message.trim(),
        photos,
      });
      toast("Dossier transmis à l'atelier.", "success");
      navigate(`/app/sav/${ticket.id}`, { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Le dossier n'a pas pu être ouvert");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;
  if (!booking) return <ErrorText>Réservation introuvable.</ErrorText>;

  return (
    <div>
      <BackLink label="Retour aux réservations" onClick={() => navigate("/app/bookings")} />

      <h1 className="font-display text-3xl tracking-tight text-ivory">Ouvrir un dossier SAV</h1>
      <p className="mb-6 mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Votre message part directement à {booking.professional?.businessName}, l'atelier qui a
        réalisé la prestation. Il vous répond ici même. Si rien ne bouge sous trois jours, nous
        reprenons la main automatiquement.
      </p>

      <Card className="mb-6">
        <SectionLabel>Prestation concernée</SectionLabel>
        <p className="font-semibold text-ivory">{booking.professional?.businessName}</p>
        <p className="mt-1 text-sm text-muted">
          Réalisée le {new Date(booking.scheduledAt).toLocaleDateString("fr-FR")} · {booking.price} €
        </p>
      </Card>

      <form onSubmit={handleSubmit} noValidate>
        <Select
          label="Motif"
          value={reason}
          onChange={(e) => setReason(e.target.value as SupportTicketReason)}
        >
          {SUPPORT_REASONS.map((r) => (
            <option key={r} value={r}>
              {SUPPORT_REASON_LABELS[r]}
            </option>
          ))}
        </Select>

        <Input
          label="Objet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="ex : léger décollement du film sur le pare-chocs"
          error={errors.subject}
        />

        <Textarea
          label="Ce que vous constatez"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Décrivez le problème, où il se situe et depuis quand."
          error={errors.message}
        />

        <PhotoPicker label="Photos (facultatif, jusqu'à 6)" photos={photos} onChange={setPhotos} />

        {formError && <ErrorText>{formError}</ErrorText>}

        <Button type="submit" full loading={submitting} className="mt-2">
          Envoyer à l'atelier
        </Button>
      </form>
    </div>
  );
}
