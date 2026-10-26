import { useState } from "react";

export interface AdminTermin {
  id: number;
  datum: string;
  vrijemePocetka: string;
  vrijemeKraja: string;
  cijena: number;
  status: string;
  korisnik: string | null;
}

export interface AdminTerminFormData {
  datum: string;
  vrijemePocetka: string;
  vrijemeKraja: string;
  cijena: string;
  ponavljajDo: string;
  ponavljaj: boolean;
}

const API = "http://localhost:5000/api/admin";

const emptyTerminData: AdminTerminFormData = {
  datum: "",
  vrijemePocetka: "",
  vrijemeKraja: "",
  cijena: "",
  ponavljajDo: "",
  ponavljaj: false,
};

export default function useProfileAdminTerms(
  token: string | null,
  isAdmin: boolean,
) {
  const [terminiObjektId, setTerminiObjektId] = useState<number | null>(null);

  const [terminiObjektNaziv, setTerminiObjektNaziv] = useState("");

  const [termini, setTermini] = useState<AdminTermin[]>([]);
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  const [showTerminiModal, setShowTerminiModal] = useState(false);

  const [showDodajTermin, setShowDodajTermin] = useState(false);

  const [editTermin, setEditTermin] = useState<AdminTermin | null>(null);

  const [terminData, setTerminData] = useState<AdminTerminFormData>({
    ...emptyTerminData,
  });

  const [spremanje, setSpremanje] = useState(false);
  const [brisanjeId, setBrisanjeId] = useState<number | null>(null);
  const [poruka, setPoruka] = useState("");

  // Dohvaćanje termina određenog objekta
  const dohvatiTermine = async (idObjekta: number) => {
    if (!token || !isAdmin) return;

    setUcitavanje(true);
    setGreska(null);

    try {
      const response = await fetch(`${API}/objekti/${idObjekta}/termini`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Dohvaćanje termina nije uspjelo.");
      }

      const data: AdminTermin[] = await response.json();
      setTermini(data);
    } catch {
      setGreska("Nije moguće učitati termine objekta.");
    } finally {
      setUcitavanje(false);
    }
  };

  // Otvaranje pregleda termina objekta
  const otvoriTermine = (idObjekta: number, naziv: string) => {
    if (!token || !isAdmin) return;

    setTerminiObjektId(idObjekta);
    setTerminiObjektNaziv(naziv);
    setTermini([]);
    setGreska(null);
    setPoruka("");
    setEditTermin(null);
    setShowDodajTermin(false);
    setTerminData({ ...emptyTerminData });
    setShowTerminiModal(true);

    void dohvatiTermine(idObjekta);
  };

  // Zatvaranje pregleda termina
  const zatvoriTermine = () => {
    if (spremanje || brisanjeId !== null) return;

    setShowTerminiModal(false);
    setShowDodajTermin(false);
    setEditTermin(null);
    setTerminiObjektId(null);
    setTerminiObjektNaziv("");
    setTermini([]);
    setGreska(null);
    setPoruka("");
  };

  // Otvaranje obrasca za novi termin
  const otvoriDodajTermin = () => {
    setEditTermin(null);
    setTerminData({ ...emptyTerminData });
    setPoruka("");
    setShowDodajTermin(true);
  };

  // Otvaranje obrasca za uređivanje termina
  const otvoriUrediTermin = (termin: AdminTermin) => {
    setEditTermin(termin);

    setTerminData({
      datum: termin.datum,
      vrijemePocetka: termin.vrijemePocetka,
      vrijemeKraja: termin.vrijemeKraja,
      cijena: String(termin.cijena),
      ponavljajDo: "",
      ponavljaj: false,
    });

    setPoruka("");
    setShowDodajTermin(true);
  };

  // Zatvaranje obrasca bez zatvaranja pregleda termina
  const zatvoriTerminFormu = () => {
    if (spremanje) return;

    setShowDodajTermin(false);
    setEditTermin(null);
    setTerminData({ ...emptyTerminData });
    setPoruka("");
  };

  // Dodavanje ili uređivanje termina
  const spremiTermin = async () => {
    if (!token || !isAdmin || terminiObjektId === null) {
      return;
    }

    if (
      (!editTermin && !terminData.datum) ||
      !terminData.vrijemePocetka ||
      !terminData.vrijemeKraja ||
      terminData.cijena === ""
    ) {
      setPoruka("Popunite sva obavezna polja.");
      return;
    }

    if (terminData.vrijemeKraja <= terminData.vrijemePocetka) {
      setPoruka("Vrijeme završetka mora biti nakon početka.");
      return;
    }

    if (
      terminData.ponavljaj &&
      !editTermin &&
      (!terminData.ponavljajDo || terminData.ponavljajDo < terminData.datum)
    ) {
      setPoruka("Odaberite ispravan završni datum ponavljanja.");
      return;
    }

    if (
      !Number.isFinite(Number(terminData.cijena)) ||
      Number(terminData.cijena) < 0
    ) {
      setPoruka("Unesite ispravnu cijenu termina.");
      return;
    }

    setSpremanje(true);
    setPoruka("");

    try {
      const isEditing = editTermin !== null;

      const url = isEditing
        ? `${API}/termini/${editTermin.id}`
        : `${API}/objekti/${terminiObjektId}/termini`;

      const body = isEditing
        ? {
            vrijemePocetka: terminData.vrijemePocetka,
            vrijemeKraja: terminData.vrijemeKraja,
            cijena: terminData.cijena,
          }
        : {
            datumPocetka: terminData.datum,
            vrijemePocetka: terminData.vrijemePocetka,
            vrijemeKraja: terminData.vrijemeKraja,
            cijena: terminData.cijena,
            ponavljajDo: terminData.ponavljaj
              ? terminData.ponavljajDo
              : undefined,
          };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        setPoruka(errorData?.greska || "Greška pri spremanju termina.");
        return;
      }

      await dohvatiTermine(terminiObjektId);

      setShowDodajTermin(false);
      setEditTermin(null);
      setTerminData({ ...emptyTerminData });
    } catch {
      setPoruka("Greška pri povezivanju sa serverom.");
    } finally {
      setSpremanje(false);
    }
  };

  // Brisanje termina
  const obrisiTermin = async (id: number) => {
    if (!token || !isAdmin) return;

    if (!window.confirm("Obrisati termin?")) return;

    setBrisanjeId(id);
    setGreska(null);

    try {
      const response = await fetch(`${API}/termini/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Brisanje termina nije uspjelo.");
      }

      setTermini((previous) => previous.filter((termin) => termin.id !== id));
    } catch {
      setGreska("Nije moguće obrisati termin.");
    } finally {
      setBrisanjeId(null);
    }
  };

  return {
    terminiObjektId,
    terminiObjektNaziv,
    termini,
    ucitavanje,
    greska,
    poruka,
    showTerminiModal,
    showDodajTermin,
    editTermin,
    terminData,
    spremanje,
    brisanjeId,
    setTerminData,
    otvoriTermine,
    zatvoriTermine,
    otvoriDodajTermin,
    otvoriUrediTermin,
    zatvoriTerminFormu,
    spremiTermin,
    obrisiTermin,
  };
}
