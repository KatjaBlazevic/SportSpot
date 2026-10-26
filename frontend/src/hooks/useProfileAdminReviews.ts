import { useCallback, useEffect, useState } from "react";
import type { ProfileTab } from "../components/Profile/profileConfig";

export interface AdminReview {
  idKorisnika: number;
  idObjekta: number;
  ocjena: number;
  komentar: string | null;
  datum: string;
  ime: string;
  prezime: string;
  nazivObjekta: string;
}

const API = "http://localhost:5000/api/admin";

export default function useProfileAdminReviews(
  token: string | null,
  aktivnaTab: ProfileTab,
  isAdmin: boolean,
) {
  const [recenzije, setRecenzije] = useState<AdminReview[]>([]);
  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [brisanjeId, setBrisanjeId] = useState<string | null>(null);

  const ucitajRecenzije = useCallback(async () => {
    if (!token || !isAdmin) return;

    setUcitavanje(true);
    setGreska(null);

    try {
      const response = await fetch(`${API}/recenzije`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Neuspješno dohvaćanje recenzija.");
      }

      const data: AdminReview[] = await response.json();
      setRecenzije(data);
    } catch {
      setGreska("Nije moguće učitati recenzije.");
    } finally {
      setUcitavanje(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    if (!isAdmin || aktivnaTab !== "recenzije") return;

    void ucitajRecenzije();
  }, [aktivnaTab, isAdmin, ucitajRecenzije]);

  const obrisiRecenziju = async (idKorisnika: number, idObjekta: number) => {
    if (!token || !isAdmin) return;

    if (!window.confirm("Obrisati recenziju?")) return;

    const reviewId = `${idKorisnika}-${idObjekta}`;

    setBrisanjeId(reviewId);
    setGreska(null);

    try {
      const response = await fetch(
        `${API}/recenzije/${idKorisnika}/${idObjekta}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Brisanje recenzije nije uspjelo.");
      }

      setRecenzije((previous) =>
        previous.filter(
          (recenzija) =>
            !(
              recenzija.idKorisnika === idKorisnika &&
              recenzija.idObjekta === idObjekta
            ),
        ),
      );
    } catch {
      setGreska("Nije moguće obrisati recenziju.");
    } finally {
      setBrisanjeId(null);
    }
  };

  return {
    recenzije,
    ucitavanje,
    greska,
    brisanjeId,
    ucitajRecenzije,
    obrisiRecenziju,
  };
}
