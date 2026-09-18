import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

export default function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-16">
      <div>
        <h1 className="mb-4 text-3xl font-bold">🚗 CarCare Connect</h1>
        <p className="text-muted leading-relaxed">
          Décrivez votre besoin (PPF, covering, céramique, vitres teintées, lustrage), notre équipe
          consulte les meilleurs professionnels pour vous et vous transmet une offre claire, un seul
          interlocuteur du début à la fin.
        </p>
      </div>
      <div className="mt-12 flex flex-col gap-3">
        <Link to="/login">
          <Button full>Se connecter</Button>
        </Link>
        <Link to="/register?role=CLIENT">
          <Button full variant="secondary">
            Créer un compte client
          </Button>
        </Link>
        <Link to="/register?role=PROFESSIONAL">
          <Button full variant="secondary">
            Je suis un professionnel
          </Button>
        </Link>
      </div>
    </div>
  );
}
