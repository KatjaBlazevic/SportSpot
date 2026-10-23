
export interface FacilitySlot {
  id: number;
  datum?: string;
  vrijemePocetka: string;
  vrijemeKraja: string;
  cijena: number;
  status: "Slobodan" | "Zauzet";
}

export interface SportsFacility {
  id: number;
  naziv: string;
  adresa: string;
  kvart: string;
  sportovi: string[];
  ocjena: number | null;
  brojRecenzija: number;
  cijenaOd: number;
  termini: FacilitySlot[];
  lat: number | null;
  lng: number | null;
  slikaUrl: string | null;
}
