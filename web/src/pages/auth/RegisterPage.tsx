import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, ErrorText, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import type { Role } from "../../types";
import { HaloBackground } from "../../components/HaloBackground";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as Role) === "PROFESSIONAL" ? "PROFESSIONAL" : "CLIENT";

  const [role, setRole] = useState<Role>(initialRole);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName || !email || password.length < 8) {
      setError("Merci de remplir tous les champs (mot de passe : 8 caractères minimum).");
      return;
    }
    if (role === "PROFESSIONAL" && !businessName) {
      setError("Le nom de votre entreprise est requis.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        email: email.trim().toLowerCase(),
        password,
        role,
        firstName,
        lastName,
        phone: phone || undefined,
        businessName: role === "PROFESSIONAL" ? businessName : undefined,
      });
      navigate(user.role === "PROFESSIONAL" ? "/pro" : "/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <HaloBackground />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-14">
        <Link to="/" className="mb-8 block font-display text-lg tracking-wide text-ivory">
          Luxury<span className="text-gold-gradient italic">Connect</span>
        </Link>

        <h1 className="mb-1 font-display text-3xl text-ivory">Créer un compte</h1>
        <p className="mb-6 text-sm text-muted">Rejoignez LuxuryConnect en tant que...</p>

        <div className="mb-6 flex rounded-xl border border-hairline bg-surface p-1">
          {(["CLIENT", "PROFESSIONAL"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                role === r ? "bg-gold-gradient text-background" : "text-muted hover:text-ivory"
              }`}
            >
              {r === "CLIENT" ? "Client" : "Professionnel"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          {role === "PROFESSIONAL" && (
            <Input
              label="Nom de l'entreprise"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="ex: Auto Shine Lyon"
            />
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" full loading={loading} className="mt-2">
            Créer mon compte
          </Button>
        </form>

        <Link to="/login" className="mt-8 block border-t border-hairline pt-6 text-center text-sm text-gold hover:text-gold-200">
          Déjà un compte ? Se connecter
        </Link>
      </div>
    </div>
  );
}
