import React from "react";
import { Button, Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Mon profil</h1>
      <Card>
        <p className="text-lg font-semibold">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="mt-1 text-sm text-muted">{user?.email}</p>
        {user?.phone && <p className="text-sm text-muted">{user.phone}</p>}
      </Card>
      <Button variant="secondary" full className="mt-4 md:hidden" onClick={logout}>
        Se déconnecter
      </Button>
    </div>
  );
}
