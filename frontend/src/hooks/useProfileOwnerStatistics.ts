import { useEffect, useState } from "react";
import type { ProfileTab } from "../components/Profile/profileConfig";

export interface StatistikaMjesec {
  mjesec: string;
  brojRezervacija: number;
  prihod: number;
}

export interface StatistikaObjekt {
  id: number;
  naziv: string;
  zauzeti: number;
  slobodni: number;
  ukupnoTermina: number;
  ukupniPrihod: number;
}

export interface OwnerStatisticsData {
  poMjesecima: StatistikaMjesec[];
  poObjektima: StatistikaObjekt[];
}

const API = "http://localhost:5000/api";

export default function useProfileOwnerStatistics(
  token: string | null,
  aktivnaTab: ProfileTab,
  isOwner: boolean,
) {
  const [statistika, setStatistika] = useState<OwnerStatisticsData | null>(
    null,
  );

  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  // Statistiku dohvaćamo samo za vlasnika kada otvori tab.
  useEffect(() => {
    if (!isOwner || !token || aktivnaTab !== "statistika") {
      return;
    }

    const controller = new AbortController();

    async function ucitajStatistiku() {
      setUcitavanje(true);
      setGreska(null);

      try {
        const response = await fetch(`${API}/vlasnik/statistika`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Dohvaćanje statistike nije uspjelo.");
        }

        const data: OwnerStatisticsData = await response.json();

        if (!controller.signal.aborted) {
          setStatistika(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setGreska("Nije moguće učitati statistiku.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setUcitavanje(false);
        }
      }
    }

    void ucitajStatistiku();

    return () => controller.abort();
  }, [token, aktivnaTab, isOwner]);

  // Izračuni preuzeti iz postojećeg ProfilVlasnik.tsx.
  const ukupnoRezervacija =
    statistika?.poObjektima.reduce((sum, objekt) => sum + objekt.zauzeti, 0) ??
    0;

  const ukupniPrihod =
    statistika?.poObjektima.reduce(
      (sum, objekt) => sum + objekt.ukupniPrihod,
      0,
    ) ?? 0;

  const ukupnoTermina =
    statistika?.poObjektima.reduce(
      (sum, objekt) => sum + objekt.ukupnoTermina,
      0,
    ) ?? 0;

  const popunjenost =
    ukupnoTermina > 0
      ? Math.round((ukupnoRezervacija / ukupnoTermina) * 100)
      : 0;

  const maxRezervacija = statistika
    ? Math.max(
        ...statistika.poMjesecima.map((mjesec) => mjesec.brojRezervacija),
        1,
      )
    : 1;

  return {
    statistika,
    ucitavanje,
    greska,
    ukupnoRezervacija,
    ukupniPrihod,
    ukupnoTermina,
    popunjenost,
    maxRezervacija,
  };
}
