import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../../layout/PublicLayout";
import { PageMeta } from "../../seo/PageMeta";
import { CONTACT_EMAIL } from "../../seo/siteConfig";
import { Button, ErrorText, Input, Select, Textarea } from "../../components/ui";
import { api, ApiError } from "../../api/client";
import { SERVICE_LABELS, ServiceType } from "../../types";
import { trackEvent } from "../../lib/analytics";

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  serviceType: string;
  message: string;
};

const EMPTY: Fields = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  serviceType: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[+0-9][0-9 .\-()]{6,19}$/;

/** Même validation que côté serveur, pour corriger avant l'envoi plutôt qu'après. */
function validate(values: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (values.firstName.trim().length < 2) errors.firstName = "Indiquez votre prénom.";
  if (values.lastName.trim().length < 2) errors.lastName = "Indiquez votre nom.";
  if (!EMAIL_RE.test(values.email.trim())) errors.email = "Cette adresse e-mail n'est pas valide.";
  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
    errors.phone = "Ce numéro ne semble pas valide.";
  }
  if (values.message.length > 2000) errors.message = "Message trop long (2000 caractères maximum).";
  return errors;
}

export default function ContactPage() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [company, setCompany] = useState(""); // pot de miel
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Un formulaire rempli en moins de trois secondes est l'œuvre d'un robot.
  const renderedAt = useMemo(() => Date.now(), []);

  function set(field: keyof Fields, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  }

  function blur(field: keyof Fields) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      serviceType: true,
      message: true,
    });
    if (Object.keys(found).length > 0) {
      setFormError("Merci de corriger les champs signalés.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await api.post("/contact", {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        city: values.city.trim() || undefined,
        serviceType: values.serviceType || undefined,
        message: values.message.trim() || undefined,
        company,
        renderedAt,
      });
      trackEvent("Contact");
      setSent(true);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "L'envoi a échoué. Réessayez dans un instant.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <PageMeta
        title="Nous contacter"
        description="Décrivez votre besoin en protection automobile : nous consultons les ateliers et revenons vers vous avec une offre unique et ferme."
      />

      <h1 className="font-display text-4xl leading-tight tracking-tight text-ivory">
        Nous contacter
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Décrivez votre besoin en quelques lignes. Nous consultons les ateliers qualifiés et
        revenons vers vous avec un seul prix, ferme. Vous pouvez aussi écrire directement à{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      {sent ? (
        <div
          role="status"
          className="mt-10 rounded-2xl border border-gold/25 bg-gold/[0.06] p-7 text-center"
        >
          <p className="font-display text-2xl text-ivory">Message bien reçu.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Nous revenons vers vous sous 24 à 48 heures ouvrées, à l'adresse{" "}
            <span className="text-ivory">{values.email.trim()}</span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-10">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Input
              label="Prénom"
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={() => blur("firstName")}
              autoComplete="given-name"
              required
              error={touched.firstName ? errors.firstName : undefined}
            />
            <Input
              label="Nom"
              value={values.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={() => blur("lastName")}
              autoComplete="family-name"
              required
              error={touched.lastName ? errors.lastName : undefined}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            autoComplete="email"
            placeholder="vous@exemple.fr"
            required
            error={touched.email ? errors.email : undefined}
          />

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Input
              label="Téléphone (optionnel)"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => blur("phone")}
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              error={touched.phone ? errors.phone : undefined}
            />
            <Input
              label="Ville (optionnel)"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              autoComplete="address-level2"
              placeholder="Lyon"
            />
          </div>

          <Select
            label="Prestation souhaitée (optionnel)"
            value={values.serviceType}
            onChange={(e) => set("serviceType", e.target.value)}
          >
            <option value="">Je ne sais pas encore</option>
            {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((key) => (
              <option key={key} value={key}>
                {SERVICE_LABELS[key]}
              </option>
            ))}
          </Select>

          <Textarea
            label="Votre besoin (optionnel)"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            onBlur={() => blur("message")}
            rows={5}
            placeholder="Véhicule, état actuel, délai souhaité…"
            error={touched.message ? errors.message : undefined}
          />

          {/* Pot de miel : masqué à l'œil et au lecteur d'écran, visible des robots. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="company">Société</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {formError && <ErrorText>{formError}</ErrorText>}

          <Button type="submit" full loading={submitting} className="mt-2">
            Envoyer ma demande
          </Button>

          <p className="mt-4 text-xs leading-relaxed text-mutedDark">
            Vos données servent uniquement à traiter votre demande. Voir la{" "}
            <Link to="/confidentialite" className="underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </p>
        </form>
      )}
    </PublicLayout>
  );
}
