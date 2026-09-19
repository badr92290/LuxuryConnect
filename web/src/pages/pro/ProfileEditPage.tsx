import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ProfessionalProfile, ServiceType, SERVICE_LABELS } from "../../types";
import { Badge, Button, Card, Checkbox, Input, SectionLabel, Textarea } from "../../components/ui";
import { PhotoPicker } from "../../components/PhotoPicker";
import { TrustBadges } from "../../components/TrustBadges";
import { fileUrl } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function ProfileEditPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isInsured, setIsInsured] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [yearsExperience, setYearsExperience] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [serviceType, setServiceType] = useState<ServiceType>("PPF");
  const [priceFrom, setPriceFrom] = useState("");
  const [savingService, setSavingService] = useState(false);

  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [isBeforeAfter, setIsBeforeAfter] = useState(true);
  const [savingImage, setSavingImage] = useState(false);

  const load = useCallback(async () => {
    if (!user?.professionalProfile) return;
    const data = await api.get<{ professional: ProfessionalProfile }>(`/professionals/${user.professionalProfile.id}`);
    setProfile(data.professional);
    setBusinessName(data.professional.businessName);
    setDescription(data.professional.description ?? "");
    setCity(data.professional.city ?? "");
    setAddress(data.professional.address ?? "");
    setIsInsured(data.professional.isInsured ?? false);
    setIsCertified(data.professional.isCertified ?? false);
    setYearsExperience(data.professional.yearsExperience ? String(data.professional.yearsExperience) : "");
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.put("/professionals/me", {
        businessName,
        description,
        city,
        address,
        isInsured,
        isCertified,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
      });
      await load();
      toast("Profil mis à jour");
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

  async function addImages() {
    if (newPhotos.length === 0) return;
    setSavingImage(true);
    try {
      for (const imageData of newPhotos) {
        await api.post("/professionals/me/portfolio", {
          imageData,
          caption: caption || undefined,
          isBeforeAfter,
        });
      }
      setNewPhotos([]);
      setCaption("");
      await load();
      toast(`${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""} ajoutée${newPhotos.length > 1 ? "s" : ""}`);
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

        <div className="mb-4 border-t border-hairline pt-4">
          <SectionLabel>Gages de confiance</SectionLabel>
          <p className="mb-3 text-xs text-mutedDark">
            Affichés au client sur l'offre finale : ils rassurent avant la décision.
          </p>
          <div className="flex flex-col gap-2">
            <Checkbox
              checked={isInsured}
              onChange={() => setIsInsured((v) => !v)}
              label="Entreprise assurée (RC professionnelle)"
            />
            <Checkbox
              checked={isCertified}
              onChange={() => setIsCertified((v) => !v)}
              label="Certifié / agréé par un fabricant"
            />
          </div>
          <div className="mt-3 max-w-[220px]">
            <Input
              label="Années d'expérience"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              inputMode="numeric"
              placeholder="12"
            />
          </div>
          <div className="mt-1">
            <TrustBadges isInsured={isInsured} isCertified={isCertified} yearsExperience={yearsExperience ? parseInt(yearsExperience) : null} />
          </div>
        </div>

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
        <h2 className="mb-1 font-semibold">Mes réalisations</h2>
        <p className="mb-4 text-xs text-mutedDark">
          Les photos marquées « avant / après » sont montrées au client avec l'offre finale.
        </p>

        {profile?.portfolioImages && profile.portfolioImages.length > 0 && (
          <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {profile.portfolioImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-hairline">
                <img src={fileUrl(img.imageUrl)} alt={img.caption ?? ""} className="h-full w-full object-cover" />
                {img.isBeforeAfter && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-background/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gold backdrop-blur">
                    Avant / après
                  </span>
                )}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute inset-x-0 bottom-0 bg-background/80 py-1 text-[10px] font-semibold text-danger opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        <PhotoPicker
          photos={newPhotos}
          onChange={setNewPhotos}
          label="Ajouter des photos"
          hint="Formats JPG, PNG ou WebP — redimensionnées automatiquement."
        />
        <Input label="Légende (optionnel)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <div className="mb-4">
          <Checkbox
            checked={isBeforeAfter}
            onChange={() => setIsBeforeAfter((v) => !v)}
            label="Ce sont des photos avant / après"
          />
        </div>
        <Button variant="secondary" onClick={addImages} loading={savingImage} disabled={newPhotos.length === 0}>
          Ajouter au portfolio
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
