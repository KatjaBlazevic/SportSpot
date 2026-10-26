import { useEffect, useState } from "react";
import type { ProfileTab } from "../components/Profile/profileConfig";

export interface AdminDashboardData {
  ukupnoKorisnika: number;
  ukupnoVlasnika: number;
  ukupnoObjekta: number;
  ukupnoPending: number;
  ukupnoKlubova: number;
  ukupnoRecenzija: number;
  ukupnoRezervacija: number;
}

export interface AdminDashboardExtra {
  topObjekti: {
    naziv: string;
    kvart: string;
    brojRezervacija: number;
    ocjena: number | null;
  }[];
  stats: {
    danas: number;
    ovajTjedan: number;
    ovajMjesec: number;
    prihodMjesec: number;
  };
}

const API = "http://localhost:5000/api/admin";

export default function useProfileAdminDashboard(
  token: string | null,
  aktivnaTab: ProfileTab,
  isAdmin: boolean,
) {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);

  const [dashboardExtra, setDashboardExtra] =
    useState<AdminDashboardExtra | null>(null);

  const [ucitavanje, setUcitavanje] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !token || aktivnaTab !== "dashboard") {
      return;
    }

    const controller = new AbortController();

    async function ucitajDashboard() {
      setUcitavanje(true);
      setGreska(null);

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Glavni i dodatni podaci dohvaćaju se istovremeno.
        const [dashboardResponse, extraResponse] = await Promise.all([
          fetch(`${API}/dashboard`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API}/dashboard/extra`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!dashboardResponse.ok || !extraResponse.ok) {
          throw new Error("Dohvaćanje dashboarda nije uspjelo.");
        }

        const [dashboardData, extraData]: [
          AdminDashboardData,
          AdminDashboardExtra,
        ] = await Promise.all([dashboardResponse.json(), extraResponse.json()]);

        if (!controller.signal.aborted) {
          setDashboard(dashboardData);
          setDashboardExtra(extraData);
        }
      } catch {
        if (!controller.signal.aborted) {
          setDashboard(null);
          setDashboardExtra(null);
          setGreska("Nije moguće učitati administratorski dashboard.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setUcitavanje(false);
        }
      }
    }

    void ucitajDashboard();

    return () => controller.abort();
  }, [token, aktivnaTab, isAdmin]);

  return {
    dashboard,
    dashboardExtra,
    ucitavanje,
    greska,
  };
}
