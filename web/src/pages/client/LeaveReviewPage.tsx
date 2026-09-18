import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { BackLink, Button, ErrorText, Textarea } from "../../components/ui";

export default function LeaveReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.post("/reviews", { bookingId, rating, comment: comment || undefined });
      navigate("/app/bookings");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer l'avis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <BackLink label="Retour" onClick={() => navigate("/app/bookings")} />
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Laisser un avis</h1>

      <div className="mb-6 flex gap-2 text-4xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onClick={() => setRating(i)} className={i <= rating ? "text-accent" : "text-border"}>
            ★
          </button>
        ))}
      </div>

      <Textarea label="Commentaire (optionnel)" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
      {error && <ErrorText>{error}</ErrorText>}
      <Button onClick={handleSubmit} loading={loading} full>
        Envoyer l'avis
      </Button>
    </div>
  );
}
