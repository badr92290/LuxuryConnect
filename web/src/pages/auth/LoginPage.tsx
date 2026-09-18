import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ErrorText, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-8 text-2xl font-bold">Connexion</h1>
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
        <Button type="submit" full loading={loading}>
          Se connecter
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-primary">
        <Link to="/register?role=CLIENT">Pas encore de compte ? Créer un compte client</Link>
        <Link to="/register?role=PROFESSIONAL">Vous êtes un professionnel ? Créer un compte pro</Link>
      </div>
    </div>
  );
}
