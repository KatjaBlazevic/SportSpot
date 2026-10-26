import { useCallback, useEffect, useState } from "react";
import type { ProfileTab } from "../components/Profile/profileConfig";

export interface AdminFacility {
  id: number;
  naziv: string;
  adresa: string;
  kvart: string;
  kapacitet: number | null;
  opis: string | null;
  slikaUrl: string | null;
  vlasnik: string;
  vlasnikId: number | null;
  sportovi: string;
  status_objekta: string;
  idKluba: number | null;
  nazivKluba: string | null;
}

export interface AdminFacilityFormData {
  naziv: string;
  adresa: string;
  kvart: string;
  kapacitet: string;
  opis: string;
  slikaUrl: string;
  vlasnikId: string;
  idKluba: string;
}

export interface AdminFacilityOwner {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  uloga: string;
}

export interface AdminFacilityClub {
  id: number;
  naziv: string;
}

export interface AdminFacilitySport {
  ID_sporta: number;
  Naziv_sporta: string;
}

const emptyFacilityData: AdminFacilityFormData = {
  naziv: "",
  adresa: "",
  kvart: "",
  kapacitet: "",
  opis: "",
  slikaUrl: "",
  vlasnikId: "",
  idKluba: "",
};

const API = "http://localhost:5000/api/admin";

export default function useProfileAdminFacilities(
  token: string | null,
  aktivnaTab: ProfileTab,
  isAdmin: boolean,
) {
  const [objekti, setObjekti] = useState<AdminFacility[]>([]);
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [akcijaId, setAkcijaId] = useState<number | null>(null);

  // Podaci potrebni za administratorski obrazac
  const [sviVlasnici, setSviVlasnici] = useState<AdminFacilityOwner[]>([]);

  const [klubovi, setKlubovi] = useState<AdminFacilityClub[]>([]);

  const [sviSportovi, setSviSportovi] = useState<AdminFacilitySport[]>([]);

  const [sviKvartovi, setSviKvartovi] = useState<string[]>([]);

  const [pomocniPodaciUcitani, setPomocniPodaciUcitani] = useState(false);

  // Modal dodavanja i uređivanja
  const [showObjektModal, setShowObjektModal] = useState(false);
  const [objektMod, setObjektMod] = useState<"dodaj" | "uredi">("dodaj");

  const [editObjektId, setEditObjektId] = useState<number | null>(null);

  const [objektData, setObjektData] = useState<AdminFacilityFormData>({
    ...emptyFacilityData,
  });

  const [odabraniSportovi, setOdabraniSportovi] = useState<number[]>([]);

  const [noviKvartAdmin, setNoviKvartAdmin] = useState(false);

  const [objektSpremanje, setObjektSpremanje] = useState(false);
  const [objektPoruka, setObjektPoruka] = useState("");

  const ucitajObjekte = useCallback(async () => {
    if (!token || !isAdmin) return;

    setUcitavanje(true);
    setGreska(null);

    try {
      const response = await fetch(`${API}/objekti`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Nije moguće dohvatiti objekte.");
      }

      const data: AdminFacility[] = await response.json();
      setObjekti(data);
    } catch {
      setGreska("Greška pri učitavanju objekata.");
    } finally {
      setUcitavanje(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    if (!isAdmin || aktivnaTab !== "objekti") return;

    void ucitajObjekte();
  }, [aktivnaTab, isAdmin, ucitajObjekte]);
  useEffect(() => {
    if (!token || !isAdmin || aktivnaTab !== "objekti") {
      return;
    }

    const controller = new AbortController();

    async function ucitajPomocnePodatke() {
      setPomocniPodaciUcitani(false);

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const responses = await Promise.all([
          fetch(`${API}/korisnici`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API}/klubovi`, {
            headers,
            signal: controller.signal,
          }),
          fetch("http://localhost:5000/api/korisnik/sportovi", {
            headers,
            signal: controller.signal,
          }),
          fetch("http://localhost:5000/api/objekti/kvartovi", {
            signal: controller.signal,
          }),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Pomoćni podaci nisu dostupni.");
        }

        const [korisniciData, kluboviData, sportoviData, kvartoviData] =
          await Promise.all([
            responses[0].json() as Promise<AdminFacilityOwner[]>,
            responses[1].json() as Promise<AdminFacilityClub[]>,
            responses[2].json() as Promise<AdminFacilitySport[]>,
            responses[3].json() as Promise<string[]>,
          ]);

        if (controller.signal.aborted) return;

        setSviVlasnici(
          korisniciData.filter(
            (korisnik) =>
              korisnik.uloga === "Vlasnik" || korisnik.uloga === "Admin",
          ),
        );

        setKlubovi(kluboviData);
        setSviSportovi(sportoviData);
        setSviKvartovi(kvartoviData);
        setPomocniPodaciUcitani(true);
      } catch {
        if (!controller.signal.aborted) {
          setGreska(
            "Nije moguće učitati vlasnike, klubove, sportove ili kvartove.",
          );
        }
      }
    }

    void ucitajPomocnePodatke();

    return () => controller.abort();
  }, [token, aktivnaTab, isAdmin]);

  // Zajednička funkcija za PUT/DELETE zahtjeve.
  const izvrsiAkciju = async (
    id: number,
    putanja: string,
    method: "PUT" | "DELETE",
    porukaGreske: string,
  ): Promise<boolean> => {
    if (!token || !isAdmin) return false;

    setAkcijaId(id);
    setGreska(null);

    try {
      const response = await fetch(`${API}/${putanja}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(porukaGreske);
      }

      await ucitajObjekte();
      return true;
    } catch {
      setGreska(porukaGreske);
      return false;
    } finally {
      setAkcijaId(null);
    }
  };

  const odobriObjekt = async (id: number) => {
    await izvrsiAkciju(
      id,
      `objekti/${id}/odobri`,
      "PUT",
      "Nije moguće odobriti objekt.",
    );
  };

  const obrisiObjekt = async (id: number) => {
    if (!window.confirm("Obrisati objekt?")) return;

    await izvrsiAkciju(
      id,
      `objekti/${id}`,
      "DELETE",
      "Nije moguće obrisati objekt.",
    );
  };

  const potvrdiObrisiObjekt = async (id: number) => {
    if (
      !window.confirm("Potvrditi brisanje objekta? Ova akcija je nepovratna.")
    ) {
      return;
    }

    await izvrsiAkciju(
      id,
      `objekti/${id}/potvrdi-brisanje`,
      "PUT",
      "Nije moguće potvrditi brisanje objekta.",
    );
  };

  const odbijObrisiObjekt = async (id: number) => {
    await izvrsiAkciju(
      id,
      `objekti/${id}/odbij-brisanje`,
      "PUT",
      "Nije moguće odbiti zahtjev za brisanje.",
    );
  };

  const otvoriDodajObjekt = () => {
    if (!pomocniPodaciUcitani) {
      setGreska("Podaci obrasca još nisu učitani.");
      return;
    }

    setObjektMod("dodaj");
    setEditObjektId(null);
    setObjektData({ ...emptyFacilityData });
    setOdabraniSportovi([]);
    setNoviKvartAdmin(false);
    setObjektPoruka("");
    setShowObjektModal(true);
  };

  const otvoriUrediObjekt = (objekt: AdminFacility) => {
    if (!pomocniPodaciUcitani) {
      setGreska("Podaci obrasca još nisu učitani.");
      return;
    }

    setObjektMod("uredi");
    setEditObjektId(objekt.id);

    setObjektData({
      naziv: objekt.naziv,
      adresa: objekt.adresa,
      kvart: objekt.kvart,
      kapacitet: objekt.kapacitet !== null ? String(objekt.kapacitet) : "",
      opis: objekt.opis || "",
      slikaUrl: objekt.slikaUrl || "",
      vlasnikId: objekt.vlasnikId !== null ? String(objekt.vlasnikId) : "",
      idKluba: objekt.idKluba !== null ? String(objekt.idKluba) : "",
    });

    const naziviSportova = objekt.sportovi ? objekt.sportovi.split(", ") : [];

    setOdabraniSportovi(
      sviSportovi
        .filter((sport) => naziviSportova.includes(sport.Naziv_sporta))
        .map((sport) => sport.ID_sporta),
    );

    setNoviKvartAdmin(!sviKvartovi.includes(objekt.kvart));

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

  const handleNoviKvartToggle = () => {
    setNoviKvartAdmin((previous) => !previous);
    setObjektData((previous) => ({
      ...previous,
      kvart: "",
    }));
  };

  const spremiObjekt = async () => {
    if (!token || !isAdmin || !pomocniPodaciUcitani) return;

    if (
      !objektData.naziv.trim() ||
      !objektData.adresa.trim() ||
      !objektData.kvart.trim()
    ) {
      setObjektPoruka("Naziv, adresa i kvart su obavezni.");
      return;
    }

    if (objektMod === "uredi" && editObjektId === null) {
      setObjektPoruka("Nije odabran objekt za uređivanje.");
      return;
    }

    setObjektSpremanje(true);
    setObjektPoruka("");

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      // Zadržavamo postojeći način geokodiranja adrese.
      try {
        const upit = encodeURIComponent(`${objektData.adresa}, Rijeka`);

        const geoResponse = await fetch(
          `https://photon.komoot.io/api/?q=${upit}&limit=1&lang=default`,
        );

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const feature = geoData.features?.[0];

          if (feature) {
            lng = feature.geometry.coordinates[0];
            lat = feature.geometry.coordinates[1];
          }
        }
      } catch {
        // Geokodiranje ne smije spriječiti spremanje objekta.
      }

      const body = {
        ...objektData,
        kapacitet: objektData.kapacitet ? Number(objektData.kapacitet) : null,
        vlasnikId: objektData.vlasnikId ? Number(objektData.vlasnikId) : null,
        idKluba: objektData.idKluba ? Number(objektData.idKluba) : null,
        sportovi: odabraniSportovi,
        lat,
        lng,
      };

      const url =
        objektMod === "dodaj"
          ? `${API}/objekti`
          : `${API}/objekti/${editObjektId}`;

      const response = await fetch(url, {
        method: objektMod === "dodaj" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        setObjektPoruka(errorData?.greska || "Greška pri spremanju objekta.");
        return;
      }

      await ucitajObjekte();
      setShowObjektModal(false);
      setObjektPoruka("");
    } catch {
      setObjektPoruka("Greška pri povezivanju sa serverom.");
    } finally {
      setObjektSpremanje(false);
    }
  };

  return {
    // Popis objekata i akcije
    objekti,
    ucitavanje,
    greska,
    akcijaId,
    ucitajObjekte,
    odobriObjekt,
    obrisiObjekt,
    potvrdiObrisiObjekt,
    odbijObrisiObjekt,

    // Pomoćni podaci
    sviVlasnici,
    klubovi,
    sviSportovi,
    sviKvartovi,
    pomocniPodaciUcitani,

    // Modal objekta
    showObjektModal,
    objektMod,
    objektData,
    objektSpremanje,
    objektPoruka,
    odabraniSportovi,
    noviKvartAdmin,

    // Funkcije obrasca
    setObjektData,
    otvoriDodajObjekt,
    otvoriUrediObjekt,
    zatvoriObjektModal,
    handleSportToggle,
    handleNoviKvartToggle,
    spremiObjekt,
  };
}
