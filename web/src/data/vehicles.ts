/**
 * Marques et modèles proposés dans les sélecteurs de véhicule.
 * Liste volontairement orientée marché français + véhicules premium.
 * L'option « Autre » laisse toujours la saisie libre pour ce qui manque.
 */
export const VEHICLE_MAKES: Record<string, string[]> = {
  "Abarth": ["500", "595", "695", "124 Spider"],
  "Alfa Romeo": ["Giulia", "Giulietta", "Stelvio", "Tonale", "Junior", "4C", "MiTo"],
  "Alpine": ["A110", "A290"],
  "Aston Martin": ["Vantage", "DB11", "DB12", "DBS", "DBX", "Rapide"],
  "Audi": [
    "A1", "A3", "A4", "A5", "A6", "A7", "A8",
    "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron GT",
    "TT", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "RSQ8", "S3", "S4", "S5",
  ],
  "Bentley": ["Continental GT", "Flying Spur", "Bentayga"],
  "BMW": [
    "Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "Série 6", "Série 7", "Série 8",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM",
    "Z4", "i3", "i4", "i5", "i7", "iX", "iX1", "iX3",
    "M2", "M3", "M4", "M5", "M8",
  ],
  "Bugatti": ["Chiron", "Veyron", "Tourbillon"],
  "BYD": ["Atto 3", "Dolphin", "Seal", "Seal U", "Tang"],
  "Chevrolet": ["Camaro", "Corvette", "Captiva", "Cruze"],
  "Chrysler": ["300C", "Voyager"],
  "Citroën": [
    "C1", "C3", "C3 Aircross", "C4", "C4 X", "C5 Aircross", "C5 X",
    "Berlingo", "SpaceTourer", "DS3", "DS4", "DS5", "Ami",
  ],
  "Cupra": ["Ateca", "Born", "Formentor", "Leon", "Tavascan", "Terramar"],
  "Dacia": ["Sandero", "Duster", "Jogger", "Spring", "Logan", "Bigster"],
  "DS Automobiles": ["DS 3", "DS 4", "DS 7", "DS 9"],
  "Ferrari": ["296", "SF90", "Roma", "Portofino", "812", "F8", "Purosangue", "488", "California"],
  "Fiat": ["500", "500X", "600", "Panda", "Tipo", "Doblo", "Ducato"],
  "Ford": [
    "Fiesta", "Focus", "Puma", "Kuga", "Mustang", "Mustang Mach-E",
    "Explorer", "Ranger", "Transit", "Tourneo",
  ],
  "Honda": ["Civic", "CR-V", "HR-V", "Jazz", "e:Ny1", "NSX"],
  "Hyundai": ["i10", "i20", "i30", "Bayon", "Kona", "Tucson", "Santa Fe", "Ioniq 5", "Ioniq 6"],
  "Jaguar": ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"],
  "Jeep": ["Avenger", "Renegade", "Compass", "Wrangler", "Grand Cherokee", "Gladiator"],
  "Kia": ["Picanto", "Rio", "Ceed", "Stonic", "Niro", "Sportage", "Sorento", "EV3", "EV6", "EV9"],
  "Lamborghini": ["Huracán", "Urus", "Revuelto", "Aventador", "Gallardo"],
  "Land Rover": [
    "Defender", "Discovery", "Discovery Sport",
    "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque",
  ],
  "Lexus": ["UX", "NX", "RX", "RZ", "ES", "LS", "LC", "LBX"],
  "Lotus": ["Emira", "Eletre", "Evija", "Elise", "Exige"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "Grecale", "MC20", "GranTurismo"],
  "Mazda": ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60", "MX-5", "MX-30"],
  "McLaren": ["720S", "750S", "Artura", "GT", "570S", "765LT"],
  "Mercedes-Benz": [
    "Classe A", "Classe B", "Classe C", "Classe E", "Classe S", "CLA", "CLS",
    "GLA", "GLB", "GLC", "GLE", "GLS", "Classe G",
    "EQA", "EQB", "EQC", "EQE", "EQS", "Classe V", "Sprinter",
    "AMG GT", "SL", "SLC",
  ],
  "MG": ["MG3", "MG4", "MG5", "ZS", "HS", "Marvel R", "Cyberster"],
  "MINI": ["Cooper", "Cooper S", "Countryman", "Clubman", "Aceman", "Cabrio", "John Cooper Works"],
  "Mitsubishi": ["Space Star", "ASX", "Eclipse Cross", "Outlander", "L200"],
  "Nissan": ["Micra", "Juke", "Qashqai", "X-Trail", "Ariya", "Leaf", "GT-R", "370Z"],
  "Opel": ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Frontera", "Combo", "Vivaro"],
  "Peugeot": [
    "108", "208", "2008", "308", "3008", "408", "508", "5008",
    "Rifter", "Partner", "Expert", "Boxer", "e-208", "e-2008",
  ],
  "Polestar": ["Polestar 2", "Polestar 3", "Polestar 4"],
  "Porsche": [
    "911", "718 Cayman", "718 Boxster", "Taycan", "Panamera",
    "Macan", "Cayenne", "Cayman", "Boxster",
  ],
  "Renault": [
    "Clio", "Captur", "Megane", "Scenic", "Arkana", "Austral", "Espace", "Rafale",
    "Twingo", "Zoe", "Kangoo", "Trafic", "Master", "R5",
  ],
  "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Wraith", "Dawn", "Spectre"],
  "Seat": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  "Škoda": ["Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq", "Elroq"],
  "Smart": ["Fortwo", "Forfour", "#1", "#3"],
  "Subaru": ["Impreza", "XV", "Forester", "Outback", "BRZ", "WRX"],
  "Suzuki": ["Swift", "Ignis", "Vitara", "S-Cross", "Jimny", "Across"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  "Toyota": [
    "Aygo X", "Yaris", "Yaris Cross", "Corolla", "Corolla Cross", "C-HR",
    "RAV4", "Highlander", "bZ4X", "Prius", "Supra", "GR86", "Land Cruiser", "Hilux", "Proace",
  ],
  "Volkswagen": [
    "Polo", "Golf", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg", "Passat", "Arteon",
    "ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz", "Caddy", "Transporter", "Multivan",
  ],
  "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60", "V90", "EX30", "EX40", "EX90", "C40"],
};

export const VEHICLE_MAKE_NAMES = Object.keys(VEHICLE_MAKES).sort((a, b) =>
  a.localeCompare(b, "fr")
);

export const OTHER_OPTION = "Autre";

/** De l'année modèle à venir jusqu'à 1990, du plus récent au plus ancien. */
export const VEHICLE_YEARS = Array.from(
  { length: new Date().getFullYear() + 1 - 1990 + 1 },
  (_, i) => new Date().getFullYear() + 1 - i
);
