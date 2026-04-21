import { useState, useMemo, useCallback, type ReactNode } from "react";
import {
  AuthContext,
  type Korisnik,
  type AuthContextType,
} from "./AuthContextDef";

function getInitialState() {
  const spremljeniToken = localStorage.getItem("sportspot_token");
  const spremljeniKorisnik = localStorage.getItem("sportspot_korisnik");
  if (spremljeniToken && spremljeniKorisnik) {
    try {
      return {
        token: spremljeniToken,
        korisnik: JSON.parse(spremljeniKorisnik) as Korisnik,
      };
    } catch {
      localStorage.removeItem("sportspot_token");
      localStorage.removeItem("sportspot_korisnik");
    }
  }
  return { token: null, korisnik: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => getInitialState());
  const [korisnik, setKorisnik] = useState<Korisnik | null>(initial.korisnik);
  const [token, setToken] = useState<string | null>(initial.token);
  const ucitavanje = false;

  const prijava = useCallback((noviToken: string, noviKorisnik: Korisnik) => {
    setToken(noviToken);
    setKorisnik(noviKorisnik);
    localStorage.setItem("sportspot_token", noviToken);
    localStorage.setItem("sportspot_korisnik", JSON.stringify(noviKorisnik));
  }, []);

  const odjava = useCallback(() => {
    setToken(null);
    setKorisnik(null);
    localStorage.removeItem("sportspot_token");
    localStorage.removeItem("sportspot_korisnik");
  }, []);

  const osvjezi = useCallback((noviKorisnik: Korisnik) => {
    setKorisnik(noviKorisnik);
    localStorage.setItem("sportspot_korisnik", JSON.stringify(noviKorisnik));
  }, []);

  const contextValue: AuthContextType = useMemo(
    () => ({ korisnik, token, prijava, odjava, osvjezi, ucitavanje }),
    [korisnik, token, ucitavanje, prijava, odjava, osvjezi]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}