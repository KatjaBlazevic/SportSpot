import { useEffect, useState } from "react";
import type { ProfileTab } from "../components/Profile/profileConfig";

export interface OmiljeniObjekt {
  id: number;
  naziv: string;
  adresa: string;
}

export interface Rezervacija {
  ID_termina: number;
  ID_objekta: number;
  Naziv_objekta: string;
  Adresa: string;
  Kvart: string;
  Naziv_kluba: string | null;
  Datum: string;
  vrijeme_pocetka: string;
  vrijeme_kraja: string;
  Cijena: number;
  Status: string;
}

const STORAGE_KEY = "sportspot_omiljeni";
const API = "http://localhost:5000/api";

function ucitajOmiljene(): OmiljeniObjekt[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as OmiljeniObjekt[]) : [];
  } catch {
    return [];
  }
}

export default function useProfileCommonData(
  token: string | null,
  aktivnaTab: ProfileTab,
) {
  const [omiljeni, setOmiljeni] = useState<OmiljeniObjekt[]>(ucitajOmiljene);

  const [rezervacije, setRezervacije] = useState<Rezervacija[]>([]);

  const [ucitavanjeRez, setUcitavanjeRez] = useState(false);

  const [greskaRez, setGreskaRez] = useState<string | null>(null);

  // Dohvaćanje rezervacija samo kada je aktivan njihov tab.
  useEffect(() => {
    if (aktivnaTab !== "rezervacije" || !token) {
      return;
    }

    const controller = new AbortController();

    async function ucitajRezervacije() {
      setUcitavanjeRez(true);
      setGreskaRez(null);

      try {
        const response = await fetch(`${API}/korisnik/moje-rezervacije`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Dohvaćanje rezervacija nije uspjelo.");
        }

        const data: Rezervacija[] = await response.json();

        if (!controller.signal.aborted) {
          setRezervacije(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setGreskaRez("Nije moguće učitati rezervacije.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setUcitavanjeRez(false);
        }
      }
    }

    void ucitajRezervacije();

    return () => controller.abort();
  }, [aktivnaTab, token]);

  // Omiljene ponovno čitamo iz localStorage pri otvaranju taba.
  useEffect(() => {
    if (aktivnaTab === "omiljeni") {
      setOmiljeni(ucitajOmiljene());
    }
  }, [aktivnaTab]);

  const ukloniOmiljeni = (id: number) => {
    const novi = ucitajOmiljene().filter((objekt) => objekt.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(novi));
    setOmiljeni(novi);
  };

  return {
    omiljeni,
    rezervacije,
    ucitavanjeRez,
    greskaRez,
    ukloniOmiljeni,
  };
}
