import { useCallback, useEffect, useState } from "react";
import type { ProfileTab } from "../components/Profile/profileConfig";

export interface AdminClub {
  id: number;
  naziv: string;
  oib: string;
  kontakt: string | null;
  objektiIds: number[];
  objektiNazivi: string[];
}

export interface AdminClubFormData {
  naziv: string;
  oib: string;
  kontakt: string;
}

const API = "http://localhost:5000/api/admin";

const emptyClubData: AdminClubFormData = {
  naziv: "",
  oib: "",
  kontakt: "",
};

export default function useProfileAdminClubs(
  token: string | null,
  aktivnaTab: ProfileTab,
  isAdmin: boolean,
) {
  const [klubovi, setKlubovi] = useState<AdminClub[]>([]);
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  const [showKlubModal, setShowKlubModal] = useState(false);
  const [klubMod, setKlubMod] = useState<"dodaj" | "uredi">("dodaj");
  const [editKlubId, setEditKlubId] = useState<number | null>(null);

  const [klubData, setKlubData] = useState<AdminClubFormData>({
    ...emptyClubData,
  });

  const [spremanje, setSpremanje] = useState(false);
  const [brisanjeId, setBrisanjeId] = useState<number | null>(null);
  const [klubPoruka, setKlubPoruka] = useState("");

  // Dohvaćanje svih klubova
  const ucitajKlubove = useCallback(async () => {
    if (!token || !isAdmin) return;

    setUcitavanje(true);
    setGreska(null);

    try {
      const response = await fetch(`${API}/klubovi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Dohvaćanje klubova nije uspjelo.");
      }

      const data: AdminClub[] = await response.json();
      setKlubovi(data);
    } catch {
      setGreska("Nije moguće učitati klubove.");
    } finally {
      setUcitavanje(false);
    }
  }, [token, isAdmin]);

  // Klubove učitavamo kada administrator otvori tab.
  useEffect(() => {
    if (!isAdmin || aktivnaTab !== "klubovi") return;

    void ucitajKlubove();
  }, [aktivnaTab, isAdmin, ucitajKlubove]);

  // Otvaranje modala za dodavanje
  const otvoriDodajKlub = () => {
    setKlubMod("dodaj");
    setEditKlubId(null);
    setKlubData({ ...emptyClubData });
    setKlubPoruka("");
    setShowKlubModal(true);
  };

  // Otvaranje modala za uređivanje
  const otvoriUrediKlub = (klub: AdminClub) => {
    setKlubMod("uredi");
    setEditKlubId(klub.id);

    setKlubData({
      naziv: klub.naziv,
      oib: klub.oib,
      kontakt: klub.kontakt || "",
    });

    setKlubPoruka("");
    setShowKlubModal(true);
  };

  const zatvoriKlubModal = () => {
    if (spremanje) return;

    setShowKlubModal(false);
    setKlubPoruka("");
  };

  // Dodavanje ili uređivanje kluba
  const spremiKlub = async () => {
    if (!token || !isAdmin) return;

    if (!klubData.naziv.trim() || !klubData.oib.trim()) {
      setKlubPoruka("Naziv kluba i OIB su obavezni.");
      return;
    }

    if (!/^\d{11}$/.test(klubData.oib.trim())) {
      setKlubPoruka("OIB mora sadržavati točno 11 znamenki.");
      return;
    }

    if (klubMod === "uredi" && editKlubId === null) {
      setKlubPoruka("Nije odabran klub za uređivanje.");
      return;
    }

    setSpremanje(true);
    setKlubPoruka("");

    try {
      const url =
        klubMod === "dodaj" ? `${API}/klubovi` : `${API}/klubovi/${editKlubId}`;

      const response = await fetch(url, {
        method: klubMod === "dodaj" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          naziv: klubData.naziv.trim(),
          oib: klubData.oib.trim(),
          kontakt: klubData.kontakt.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        setKlubPoruka(errorData?.greska || "Greška pri spremanju kluba.");
        return;
      }

      await ucitajKlubove();

      setShowKlubModal(false);
      setKlubData({ ...emptyClubData });
      setEditKlubId(null);
    } catch {
      setKlubPoruka("Greška pri povezivanju sa serverom.");
    } finally {
      setSpremanje(false);
    }
  };

  // Brisanje kluba
  const obrisiKlub = async (id: number) => {
    if (!token || !isAdmin) return;

    if (!window.confirm("Obrisati klub?")) return;

    setBrisanjeId(id);
    setGreska(null);

    try {
      const response = await fetch(`${API}/klubovi/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        setGreska(errorData?.greska || "Nije moguće obrisati klub.");
        return;
      }

      await ucitajKlubove();
    } catch {
      setGreska("Greška pri brisanju kluba.");
    } finally {
      setBrisanjeId(null);
    }
  };

  return {
    klubovi,
    ucitavanje,
    greska,
    showKlubModal,
    klubMod,
    editKlubId,
    klubData,
    spremanje,
    brisanjeId,
    klubPoruka,
    setKlubData,
    ucitajKlubove,
    otvoriDodajKlub,
    otvoriUrediKlub,
    zatvoriKlubModal,
    spremiKlub,
    obrisiKlub,
  };
}
