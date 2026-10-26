import { useCallback, useEffect, useState } from "react";

import type { ProfileTab } from "../components/Profile/profileConfig";
import type { MojObjekt } from "../components/Profile/ProfileOwnerFacilities";

export interface Sport {
  ID_sporta: number;
  Naziv_sporta: string;
}

export interface OwnerFacilityData {
  naziv: string;
  adresa: string;
  kvart: string;
  kapacitet: string;
  opis: string;
  slikaUrl: string;
}

const API = "http://localhost:5000/api";

const emptyFacilityData: OwnerFacilityData = {
  naziv: "",
  adresa: "",
  kvart: "",
  kapacitet: "",
  opis: "",
  slikaUrl: "",
};

export default function useProfileOwnerFacilities(
  token: string | null,
  aktivnaTab: ProfileTab,
  isOwner: boolean,
) {
  const [objekti, setObjekti] = useState<MojObjekt[]>([]);
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  const [sviSportovi, setSviSportovi] = useState<Sport[]>([]);
  const [sviKvartovi, setSviKvartovi] = useState<string[]>([]);
  const [odabraniSportovi, setOdabraniSportovi] = useState<number[]>([]);
  const [naziviPostojecihSportova, setNaziviPostojecihSportova] = useState<
    string[]
  >([]);

  const [showObjektModal, setShowObjektModal] = useState(false);
  const [objektMod, setObjektMod] = useState<"dodaj" | "uredi">("dodaj");
  const [editObjektId, setEditObjektId] = useState<number | null>(null);
  const [objektData, setObjektData] =
    useState<OwnerFacilityData>(emptyFacilityData);

  const [objektSpremanje, setObjektSpremanje] = useState(false);
  const [objektPoruka, setObjektPoruka] = useState("");

  // Dohvaćanje vlasnikovih objekata
  const osvjeziObjekte = useCallback(async () => {
    if (!token || !isOwner) return;

    setUcitavanje(true);
    setGreska(null);

    try {
      const response = await fetch(`${API}/vlasnik/moji-objekti`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Dohvaćanje objekata nije uspjelo.");
      }

      const data: MojObjekt[] = await response.json();
      setObjekti(data);
    } catch {
      setGreska("Nije moguće učitati vaše objekte.");
    } finally {
      setUcitavanje(false);
    }
  }, [token, isOwner]);

  useEffect(() => {
    if (aktivnaTab !== "mojiObjekti" || !isOwner) return;

    void osvjeziObjekte();
  }, [aktivnaTab, isOwner, osvjeziObjekte]);

  // Podaci potrebni za obrazac objekta
  useEffect(() => {
    if (!showObjektModal || !token || !isOwner) return;

    const headers = { Authorization: `Bearer ${token}` };

    void fetch(`${API}/korisnik/sportovi`, { headers })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: Sport[]) => setSviSportovi(data))
      .catch(() => setObjektPoruka("Nije moguće učitati sportove."));

    void fetch(`${API}/objekti/kvartovi`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: string[]) => setSviKvartovi(data))
      .catch(() => setObjektPoruka("Nije moguće učitati kvartove."));
  }, [showObjektModal, token, isOwner]);

  useEffect(() => {
    if (objektMod !== "uredi" || !showObjektModal) return;

    setOdabraniSportovi(
      sviSportovi
        .filter((sport) =>
          naziviPostojecihSportova.includes(sport.Naziv_sporta),
        )
        .map((sport) => sport.ID_sporta),
    );
  }, [sviSportovi, naziviPostojecihSportova, objektMod, showObjektModal]);

  const otvoriDodajObjekt = () => {
    setObjektData({ ...emptyFacilityData });
    setOdabraniSportovi([]);
    setNaziviPostojecihSportova([]);
    setObjektMod("dodaj");
    setEditObjektId(null);
    setObjektPoruka("");
    setShowObjektModal(true);
  };

  const otvoriUrediObjekt = (objekt: MojObjekt) => {
    setObjektData({
      naziv: objekt.Naziv_objekta,
      adresa: objekt.Adresa,
      kvart: objekt.Kvart,
      kapacitet: objekt.Kapacitet !== null ? String(objekt.Kapacitet) : "",
      opis: objekt.Opis || "",
      slikaUrl: objekt.Slika_url || "",
    });

    const naziviSportova = objekt.sportovi?.split(", ") ?? [];

    setNaziviPostojecihSportova(naziviSportova);

    setOdabraniSportovi(
      sviSportovi
        .filter((sport) => naziviSportova.includes(sport.Naziv_sporta))
        .map((sport) => sport.ID_sporta),
    );

    setObjektMod("uredi");
    setEditObjektId(objekt.ID_objekta);
    setObjektPoruka("");
    setShowObjektModal(true);
  };

  const zatvoriObjektModal = () => {
    if (objektSpremanje) return;

    setShowObjektModal(false);
    setObjektPoruka("");
  };

  const handleSportToggle = (id: number) => {
    setOdabraniSportovi((previous) =>
      previous.includes(id)
        ? previous.filter((sportId) => sportId !== id)
        : [...previous, id],
    );
  };

  // Dodavanje ili uređivanje objekta
  const spremiObjekt = async () => {
    if (!token || !isOwner) return;

    if (
      !objektData.naziv.trim() ||
      !objektData.adresa.trim() ||
      !objektData.kvart
    ) {
      setObjektPoruka("Naziv, adresa i kvart su obavezni.");
      return;
    }

    setObjektSpremanje(true);
    setObjektPoruka("");

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      try {
        const upit = encodeURIComponent(`${objektData.adresa}, Rijeka`);

        const geoResponse = await fetch(
          `https://photon.komoot.io/api/?q=${upit}&limit=1&lang=default`,
        );

        if (!geoResponse.ok) throw new Error();

        const geoData = await geoResponse.json();
        const feature = geoData.features?.[0];

        if (feature) {
          lng = feature.geometry.coordinates[0];
          lat = feature.geometry.coordinates[1];
        }
      } catch {
        // Objekt se i dalje može spremiti bez koordinata.
      }

      const body = {
        ...objektData,
        kapacitet: objektData.kapacitet ? Number(objektData.kapacitet) : null,
        opis: objektData.opis || null,
        slikaUrl: objektData.slikaUrl || null,
        sportovi: odabraniSportovi,
        lat,
        lng,
      };

      const url =
        objektMod === "uredi"
          ? `${API}/vlasnik/objekti/${editObjektId}`
          : `${API}/vlasnik/objekti`;

      const response = await fetch(url, {
        method: objektMod === "uredi" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Spremanje nije uspjelo.");
      }

      setShowObjektModal(false);
      await osvjeziObjekte();
    } catch {
      setObjektPoruka("Greška pri spremanju objekta.");
    } finally {
      setObjektSpremanje(false);
    }
  };

  // Zahtjev za brisanje objekta
  const zatraziObrisiObjekt = async (id: number, naziv: string) => {
    if (!token || !isOwner) return;

    if (
      !window.confirm(
        `Poslati zahtjev za brisanje objekta "${naziv}"? Administrator mora potvrditi brisanje.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API}/vlasnik/objekti/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        window.alert(data.greska || "Greška pri slanju zahtjeva.");
        return;
      }

      await osvjeziObjekte();
    } catch {
      window.alert("Greška sa serverom.");
    }
  };

  return {
    objekti,
    ucitavanje,
    greska,
    sviSportovi,
    sviKvartovi,
    odabraniSportovi,
    showObjektModal,
    objektMod,
    objektData,
    objektSpremanje,
    objektPoruka,
    setObjektData,
    otvoriDodajObjekt,
    otvoriUrediObjekt,
    zatvoriObjektModal,
    handleSportToggle,
    spremiObjekt,
    zatraziObrisiObjekt,
  };
}
