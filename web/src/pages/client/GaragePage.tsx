import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { Vehicle } from "../../types";
import { Button, Card, EmptyState, ErrorText, Input, Reveal, SkeletonList } from "../../components/ui";
import { IconCar, IconPlus, IconTrash } from "../../components/icons";
import { VehiclePicker } from "../../components/VehiclePicker";
import { useToast } from "../../context/ToastContext";

export default function GaragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const data = await api.get<{ vehicles: Vehicle[] }>("/vehicles");
    setVehicles(data.vehicles);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setMake("");
    setModel("");
    setYear("");
    setPlate("");
    setError(null);
  }

  async function save() {
    if (!make.trim() || !model.trim()) {
      setError("La marque et le modèle sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post("/vehicles", {
        make: make.trim(),
        model: model.trim(),
        year: year ? parseInt(year) : undefined,
        plate: plate.trim() || undefined,
      });
      resetForm();
      setAdding(false);
      await load();
      toast("Véhicule ajouté à votre garage");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer le véhicule");
    } finally {
      setSaving(false);
    }
  }

  async function remove(vehicle: Vehicle) {
    await api.delete(`/vehicles/${vehicle.id}`);
    await load();
    toast(`${vehicle.make} ${vehicle.model} retiré du garage`, "info");
  }

  if (!vehicles) return <SkeletonList count={3} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ivory">Mon garage</h1>
          <p className="mt-1 text-sm text-muted">
            Enregistrez vos véhicules pour ne plus les ressaisir à chaque demande.
          </p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} className="shrink-0">
            <IconPlus className="h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>

      {adding && (
        <Card glass className="mb-4 border-gold/30">
          <h2 className="mb-4 font-semibold text-ivory">Nouveau véhicule</h2>
          <VehiclePicker
            value={{ make, model, year }}
            onChange={(v) => {
              setMake(v.make);
              setModel(v.model);
              setYear(v.year);
            }}
          />
          <Input label="Plaque (optionnel)" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="AB-123-CD" />
          {error && <ErrorText>{error}</ErrorText>}
          <div className="flex gap-3">
            <Button onClick={save} loading={saving}>
              Enregistrer
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setAdding(false);
              }}
            >
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {vehicles.length === 0 && !adding && (
        <EmptyState message="Aucun véhicule enregistré pour le moment." />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {vehicles.map((vehicle, i) => (
          <Reveal key={vehicle.id} index={i}>
            <Card className="flex h-full items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 rounded-lg border border-gold/25 bg-gold/10 p-2 text-gold">
                  <IconCar className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ivory">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {vehicle.year ?? "Année non précisée"}
                    {vehicle.plate ? ` · ${vehicle.plate}` : ""}
                  </p>
                  <button
                    onClick={() => navigate(`/app/requests/new?vehicleId=${vehicle.id}`)}
                    className="mt-2 text-sm font-semibold text-gold transition-colors hover:text-gold-200"
                  >
                    Demander un devis →
                  </button>
                </div>
              </div>
              <button
                onClick={() => remove(vehicle)}
                className="-mr-1.5 -mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surfaceAlt hover:text-danger"
                aria-label={`Supprimer ${vehicle.make} ${vehicle.model} du garage`}
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
