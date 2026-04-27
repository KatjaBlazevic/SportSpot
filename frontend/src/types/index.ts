export interface Termin {
  id: number;
  datum: string;
  vrijemePocetka: string;
  vrijemeKraja: string;
  cijena: number;
  status: string;
}

export interface Recenzija {
  ime: string;
  prezime: string;
  ocjena: number;
  komentar: string;
  datumObjave: string;
}

export interface DetaljiObjekta {
  id: number;
  naziv: string;
  adresa: string;
  opis: string;
  kvart: string;
  kapacitet: number;
  nazivKluba: string;
  kontaktTelefon: string;
  ocjena: number | null;
  brojRecenzija: number;
  sportovi: string[];
  termini: Termin[];
  recenzije: Recenzija[];
  slikaUrl: string;
}

export interface InfoSekcijaProps {
  adresa: string;
  kvart: string;
  kapacitet: number;
  klub: string;
  opis: string;
}
