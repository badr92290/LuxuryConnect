import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ErrorText, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";
import { HaloBackground } from "../../components/HaloBackground";
import { PageMeta } from "../../seo/PageMeta";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "PROFESSIONAL") navigate("/pro");
      else navigate("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de se connecter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <PageMeta
        title="Connexion"
        description="Accédez à votre espace LuxuryConnect : suivi de vos demandes, offres reçues et réservations."
        noIndex
      />
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <HaloBackground />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <Link to="/" className="mb-10 block font-display text-lg tracking-wide text-ivory">
          Luxury<span className="text-gold-gradient italic">Connect</span>
        </Link>

        <h1 className="mb-1 font-display text-3xl text-ivory">Connexion</h1>
        <p className="mb-8 text-sm text-muted">Accédez à votre espace.</p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" full loading={loading} className="mt-2">
            Se connecter
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center border-t border-hairline pt-4 text-center text-sm">
          <Link
            to="/register?role=CLIENT"
            className="inline-block px-2 py-2.5 text-gold transition-colors hover:text-gold-200"
          >
            Pas encore de compte ? Créer un compte client
          </Link>
          <Link
            to="/register?role=PROFESSIONAL"
            className="inline-block px-2 py-2.5 text-muted transition-colors hover:text-ivory"
          >
            Vous êtes un professionnel ? Créer un compte pro
          </Link>
        </div>
      </div>
    </div>
  );
}
