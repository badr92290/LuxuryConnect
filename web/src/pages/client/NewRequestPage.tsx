import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, ErrorText, Input, Select, SectionLabel, Textarea } from "../../components/ui";
import { PhotoPicker } from "../../components/PhotoPicker";
import { VehiclePicker } from "../../components/VehiclePicker";
import { IconCar } from "../../components/icons";
import { api, ApiError } from "../../api/client";
import { ServiceType, SERVICE_LABELS, Vehicle } from "../../types";
import { useToast } from "../../context/ToastContext";

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function NewRequestPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(params.get("vehicleId"));

  const [serviceType, setServiceType] = useState<ServiceType>("PPF");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ vehicles: Vehicle[] }>("/vehicles").then((d) => setVehicles(d.vehicles));
  }, []);

  // Sélectionner un véhicule du garage pré-remplit les champs du formulaire.
  function selectVehicle(vehicle: Vehicle | null) {
    setVehicleId(vehicle?.id ?? null);
    setVehicleMake(vehicle?.make ?? "");
    setVehicleModel(vehicle?.model ?? "");
    setVehicleYear(vehicle?.year ? String(vehicle.year) : "");
  }

  useEffect(() => {
    if (!vehicleId || vehicles.length === 0) return;
    const match = vehicles.find((v) => v.id === vehicleId);
    if (match) selectVehicle(match);
  }, [vehicles, vehicleId]);

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
        vehicleId: vehicleId ?? undefined,
        vehicleMake,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
        city: city || undefined,
        description: description || undefined,
        photos: photos.length ? photos : undefined,
      });
      toast("Demande envoyée, nous revenons vers vous rapidement");
      navigate("/app/requests");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 font-display text-3xl tracking-tight text-ivory">Nouvelle demande de devis</h1>
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

        {vehicles.length > 0 && (
          <div className="mb-4">
            <SectionLabel>Depuis mon garage</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectVehicle(vehicleId === v.id ? null : v)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-200 ${
                    vehicleId === v.id
                      ? "border-gold bg-gold/10 text-gold shadow-gold"
                      : "border-border text-muted hover:border-gold/40 hover:text-ivory"
                  }`}
                >
                  <IconCar className="h-4 w-4" />
                  {v.make} {v.model}
                </button>
              ))}
            </div>
          </div>
        )}

        <VehiclePicker
          value={{ make: vehicleMake, model: vehicleModel, year: vehicleYear }}
          onChange={(v) => {
            setVehicleMake(v.make);
            setVehicleModel(v.model);
            setVehicleYear(v.year);
          }}
        />
        <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lyon" />

        <PhotoPicker photos={photos} onChange={setPhotos} />

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
