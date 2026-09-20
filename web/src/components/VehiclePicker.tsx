import React, { useEffect, useState } from "react";
import { Input, Select } from "./ui";
import {
  OTHER_OPTION,
  VEHICLE_MAKES,
  VEHICLE_MAKE_NAMES,
  VEHICLE_YEARS,
} from "../data/vehicles";

export interface VehicleSelection {
  make: string;
  model: string;
  year: string;
}

/**
 * Marque -> modèle -> année, en listes déroulantes.
 * Une marque ou un modèle absent de la liste bascule sur une saisie libre.
 */
export function VehiclePicker({
  value,
  onChange,
  yearRequired = false,
}: {
  value: VehicleSelection;
  onChange: (value: VehicleSelection) => void;
  yearRequired?: boolean;
}) {
  const [otherMake, setOtherMake] = useState(false);
  const [otherModel, setOtherModel] = useState(false);

  const knownMake = VEHICLE_MAKE_NAMES.includes(value.make);
  const models = knownMake ? VEHICLE_MAKES[value.make] : [];

  // Une valeur venue du garage peut déjà être hors liste : on ouvre la saisie libre.
  const makeIsCustom = otherMake || (value.make !== "" && !knownMake);
  const modelIsCustom =
    !makeIsCustom && (otherModel || (value.model !== "" && knownMake && !models.includes(value.model)));

  useEffect(() => {
    if (knownMake) setOtherMake(false);
  }, [knownMake]);

  function selectMake(next: string) {
    if (next === OTHER_OPTION) {
      setOtherMake(true);
      setOtherModel(false);
      onChange({ ...value, make: "", model: "" });
      return;
    }
    setOtherMake(false);
    setOtherModel(false);
    onChange({ ...value, make: next, model: "" });
  }

  function selectModel(next: string) {
    if (next === OTHER_OPTION) {
      setOtherModel(true);
      onChange({ ...value, model: "" });
      return;
    }
    setOtherModel(false);
    onChange({ ...value, model: next });
  }

  return (
    <>
      <Select
        label="Marque"
        value={makeIsCustom ? OTHER_OPTION : value.make}
        onChange={(e) => selectMake(e.target.value)}
      >
        <option value="">Choisir une marque…</option>
        {VEHICLE_MAKE_NAMES.map((make) => (
          <option key={make} value={make}>
            {make}
          </option>
        ))}
        <option value={OTHER_OPTION}>{OTHER_OPTION}…</option>
      </Select>

      {makeIsCustom && (
        <Input
          label="Précisez la marque"
          value={value.make}
          onChange={(e) => onChange({ ...value, make: e.target.value })}
          placeholder="Marque du véhicule"
        />
      )}

      {makeIsCustom ? (
        <Input
          label="Modèle"
          value={value.model}
          onChange={(e) => onChange({ ...value, model: e.target.value })}
          placeholder="Modèle du véhicule"
        />
      ) : (
        <>
          <Select
            label="Modèle"
            value={modelIsCustom ? OTHER_OPTION : value.model}
            onChange={(e) => selectModel(e.target.value)}
            disabled={!knownMake}
          >
            <option value="">
              {knownMake ? "Choisir un modèle…" : "Choisissez d'abord une marque"}
            </option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
            {knownMake && <option value={OTHER_OPTION}>{OTHER_OPTION}…</option>}
          </Select>

          {modelIsCustom && (
            <Input
              label="Précisez le modèle"
              value={value.model}
              onChange={(e) => onChange({ ...value, model: e.target.value })}
              placeholder="Modèle du véhicule"
            />
          )}
        </>
      )}

      <Select
        label={yearRequired ? "Année" : "Année (optionnel)"}
        value={value.year}
        onChange={(e) => onChange({ ...value, year: e.target.value })}
      >
        <option value="">Choisir une année…</option>
        {VEHICLE_YEARS.map((year) => (
          <option key={year} value={String(year)}>
            {year}
          </option>
        ))}
      </Select>
    </>
  );
}
