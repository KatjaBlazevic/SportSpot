import { useCallback, useEffect, useState } from "react";
import type {
  ProfileRole,
  ProfileTab,
} from "../components/Profile/profileConfig";

export interface AdminUser {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  brojMobitela: string | null;
  uloga: ProfileRole;
}

export interface NewAdminUser {
  ime: string;
  prezime: string;
  email: string;
  lozinka: string;
  brojMobitela: string;
  uloga: ProfileRole;
}

const API = "http://localhost:5000/api/admin";

const emptyUser: NewAdminUser = {
  ime: "",
  prezime: "",
  email: "",
  lozinka: "",
  brojMobitela: "",
  uloga: "User",
};

export default function useProfileAdminUsers(
  token: string | null,
  aktivnaTab: ProfileTab,
  isAdmin: boolean,
) {
  const [korisnici, setKorisnici] = useState<AdminUser[]>([]);
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [poruka, setPoruka] = useState("");

  const [showKorisnikModal, setShowKorisnikModal] = useState(false);
  const [noviKorisnik, setNoviKorisnik] = useState<NewAdminUser>({
    ...emptyUser,
  });
  const [spremanje, setSpremanje] = useState(false);
  const [akcijaId, setAkcijaId] = useState<number | null>(null);

  // Dohvaćanje svih korisnika
  const ucitajKorisnike = useCallback(async () => {
    if (!token || !isAdmin) return;

    setUcitavanje(true);
    setGreska(null);

    try {
      const response = await fetch(`${API}/korisnici`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Dohvaćanje korisnika nije uspjelo.");
      }

      const data: AdminUser[] = await response.json();
      setKorisnici(data);
    } catch {
      setGreska("Nije moguće učitati korisnike.");
    } finally {
      setUcitavanje(false);
    }
  }, [token, isAdmin]);

  // Podaci se dohvaćaju kada administrator otvori tab Korisnici.
  useEffect(() => {
    if (!isAdmin || aktivnaTab !== "korisnici") return;

    void ucitajKorisnike();
  }, [aktivnaTab, isAdmin, ucitajKorisnike]);

  // Otvaranje obrasca za novog korisnika
  const otvoriKorisnikModal = () => {
    setNoviKorisnik({ ...emptyUser });
    setPoruka("");
    setShowKorisnikModal(true);
  };

  const zatvoriKorisnikModal = () => {
    if (spremanje) return;

    setShowKorisnikModal(false);
    setPoruka("");
  };

  // Dodavanje novog korisnika
  const spremiKorisnika = async () => {
    if (!token || !isAdmin) return;

    if (
      !noviKorisnik.ime.trim() ||
      !noviKorisnik.prezime.trim() ||
      !noviKorisnik.email.trim() ||
      !noviKorisnik.lozinka
    ) {
      setPoruka("Popunite sva obavezna polja.");
      return;
    }

    setSpremanje(true);
    setPoruka("");

    try {
      const response = await fetch(`${API}/korisnici`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noviKorisnik),
      });

      if (!response.ok) {
        throw new Error("Dodavanje korisnika nije uspjelo.");
      }

      await ucitajKorisnike();

      setShowKorisnikModal(false);
      setNoviKorisnik({ ...emptyUser });
    } catch {
      setPoruka("Greška pri dodavanju korisnika.");
    } finally {
      setSpremanje(false);
    }
  };

  // Promjena uloge postojećeg korisnika
  const promijeniUlogu = async (id: number, uloga: ProfileRole) => {
    if (!token || !isAdmin) return;

    setAkcijaId(id);
    setGreska(null);

    try {
      const response = await fetch(`${API}/korisnici/${id}/uloga`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uloga }),
      });

      if (!response.ok) {
        throw new Error("Promjena uloge nije uspjela.");
      }

      setKorisnici((previous) =>
        previous.map((korisnik) =>
          korisnik.id === id ? { ...korisnik, uloga } : korisnik,
        ),
      );
    } catch {
      setGreska("Nije moguće promijeniti ulogu korisnika.");
    } finally {
      setAkcijaId(null);
    }
  };

  // Brisanje korisnika
  const obrisiKorisnika = async (id: number) => {
    if (!token || !isAdmin) return;

    if (!window.confirm("Obrisati korisnika?")) return;

    setAkcijaId(id);
    setGreska(null);

    try {
      const response = await fetch(`${API}/korisnici/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Brisanje korisnika nije uspjelo.");
      }

      setKorisnici((previous) =>
        previous.filter((korisnik) => korisnik.id !== id),
      );
    } catch {
      setGreska("Nije moguće obrisati korisnika.");
    } finally {
      setAkcijaId(null);
    }
  };

  return {
    korisnici,
    ucitavanje,
    greska,
    poruka,
    showKorisnikModal,
    noviKorisnik,
    spremanje,
    akcijaId,
    setNoviKorisnik,
    otvoriKorisnikModal,
    zatvoriKorisnikModal,
    spremiKorisnika,
    promijeniUlogu,
    obrisiKorisnika,
    ucitajKorisnike,
  };
}
