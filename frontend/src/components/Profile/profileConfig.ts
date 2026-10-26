import type { Korisnik } from "../../context/AuthContextDef";

export type ProfileRole = Korisnik["uloga"];

export type ProfileTab =
  | "rezervacije"
  | "omiljeni"
  | "mojiObjekti"
  | "statistika"
  | "dashboard"
  | "korisnici"
  | "objekti"
  | "klubovi"
  | "recenzije";

export type ProfileTabConfig = {
  id: ProfileTab;
  label: string;
};

const userTabs: ProfileTabConfig[] = [
  { id: "rezervacije", label: "📅 Moje rezervacije" },
  { id: "omiljeni", label: "❤️ Omiljeni" },
];

const ownerTabs: ProfileTabConfig[] = [
  { id: "statistika", label: "📊 Statistika" },
  { id: "mojiObjekti", label: "🏟️ Moji objekti" },
  ...userTabs,
];

const adminTabs: ProfileTabConfig[] = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "korisnici", label: "👥 Korisnici" },
  { id: "objekti", label: "🏟️ Objekti" },
  { id: "klubovi", label: "⚽ Klubovi" },
  { id: "recenzije", label: "⭐ Recenzije" },
  ...userTabs,
];

export const profileTabs: Record<ProfileRole, ProfileTabConfig[]> = {
  User: userTabs,
  Vlasnik: ownerTabs,
  Admin: adminTabs,
};

export const defaultProfileTab: Record<ProfileRole, ProfileTab> = {
  User: "rezervacije",
  Vlasnik: "statistika",
  Admin: "dashboard",
};
