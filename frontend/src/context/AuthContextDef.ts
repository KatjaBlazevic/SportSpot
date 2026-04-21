import { createContext } from "react";

export interface Korisnik {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  uloga: "User" | "Vlasnik" | "Admin";
}

export interface AuthContextType {
  korisnik: Korisnik | null;
  token: string | null;
  prijava: (token: string, korisnik: Korisnik) => void;
  odjava: () => void;
  ucitavanje: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);