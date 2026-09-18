import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ErrorText, Input, Select, Textarea } from "../../components/ui";
import { api, ApiError } from "../../api/client";
import { ServiceType, SERVICE_LABELS } from "../../types";

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function NewRequestPage() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<ServiceType>("PPF");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vehicleMake || !vehicleModel) {
      setError("Merci d'indiquer au moins la marque et le modèle du véhicule.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/quote-requests", {
        serviceType,
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        city: city || undefined,
        description: description || undefined,
      });
      navigate("/app/requests");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold">Nouvelle demande de devis</h1>
      <p className="mb-6 text-sm text-muted">
        Décrivez votre besoin : notre équipe la transmet aux professionnels adaptés et vous revient avec
        une offre claire, tarif et délai inclus.
      </p>

      <form onSubmit={handleSubmit}>
        <Select label="Prestation souhaitée" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABELS[s]}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Marque" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Peugeot" />
          <Input label="Modèle" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="308" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Année (optionnel)"
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            placeholder="2022"
            inputMode="numeric"
          />
          <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lyon" />
        </div>
        <Textarea
          label="Décrivez votre besoin (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" full loading={loading}>
          Envoyer ma demande
        </Button>
      </form>
    </div>
  );
}
