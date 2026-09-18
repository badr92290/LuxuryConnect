import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ProfessionalProfile, ServiceType, SERVICE_LABELS } from "../../types";
import { Badge, Button, Card, Input, Textarea } from "../../components/ui";

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function ProfileEditPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [serviceType, setServiceType] = useState<ServiceType>("PPF");
  const [priceFrom, setPriceFrom] = useState("");
  const [savingService, setSavingService] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [savingImage, setSavingImage] = useState(false);

  const load = useCallback(async () => {
    if (!user?.professionalProfile) return;
    const data = await api.get<{ professional: ProfessionalProfile }>(`/professionals/${user.professionalProfile.id}`);
    setProfile(data.professional);
    setBusinessName(data.professional.businessName);
    setDescription(data.professional.description ?? "");
    setCity(data.professional.city ?? "");
    setAddress(data.professional.address ?? "");
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.put("/professionals/me", { businessName, description, city, address });
      await load();
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveService() {
    if (!priceFrom) return;
    setSavingService(true);
    try {
      await api.put("/professionals/me/services", { serviceType, priceFrom: parseFloat(priceFrom) });
      setPriceFrom("");
      await load();
    } finally {
      setSavingService(false);
    }
  }

  async function addImage() {
    if (!imageUrl) return;
    setSavingImage(true);
    try {
      await api.post("/professionals/me/portfolio", { imageUrl, caption: caption || undefined });
      setImageUrl("");
      setCaption("");
      await load();
    } finally {
      setSavingImage(false);
    }
  }

  async function removeImage(id: string) {
    await api.delete(`/professionals/me/portfolio/${id}`);
    await load();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Mon profil professionnel</h1>

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Informations</h2>
        <Input label="Nom de l'entreprise" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <Button onClick={saveProfile} loading={savingProfile}>
          Enregistrer
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Mes prestations</h2>
        {profile?.services && profile.services.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {profile.services.map((s) => (
              <Badge key={s.id} label={`${SERVICE_LABELS[s.serviceType]} · dès ${s.priceFrom}€`} />
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="col-span-2 block mb-4 sm:col-span-1">
            <span className="mb-1.5 block text-sm text-muted">Prestation</span>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-white"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <Input label="Prix à partir de (€)" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} inputMode="decimal" />
        </div>
        <Button variant="secondary" onClick={saveService} loading={savingService}>
          Ajouter / mettre à jour
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Portfolio</h2>
        {profile?.portfolioImages && profile.portfolioImages.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {profile.portfolioImages.map((img) => (
              <div key={img.id} className="w-32">
                <img src={img.imageUrl} className="h-24 w-32 rounded-xl bg-surfaceAlt object-cover" />
                <button onClick={() => removeImage(img.id)} className="mt-1 w-full text-xs text-danger">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
        <Input label="URL de la photo" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <Input label="Légende (optionnel)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Button variant="secondary" onClick={addImage} loading={savingImage}>
          Ajouter une photo
        </Button>
      </Card>

      <Card>
        <p className="font-semibold">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-sm text-muted">{user?.email}</p>
      </Card>
      <Button variant="secondary" full className="mt-4 md:hidden" onClick={logout}>
        Se déconnecter
      </Button>
    </div>
  );
}
