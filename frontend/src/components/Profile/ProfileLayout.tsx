import { useState } from "react";
import type { ReactNode } from "react";

import type { Korisnik } from "../../context/AuthContextDef";
import useProfileCommonData from "../../hooks/useProfileCommonData";

import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";
import ProfileReservations from "./ProfileReservations";
import ProfileFavorites from "./ProfileFavorites";

import { defaultProfileTab, type ProfileTab } from "./profileConfig";

interface ProfileLayoutProps {
  korisnik: Korisnik;
  onEdit?: () => void;
  additionalContent?: Partial<Record<ProfileTab, ReactNode>>;
}

export default function ProfileLayout({
  korisnik,
  onEdit,
  additionalContent = {},
}: ProfileLayoutProps) {
  // Aktivni tab ovisno o ulozi korisnika
  const [aktivnaTab, setAktivnaTab] = useState<ProfileTab>(
    () => defaultProfileTab[korisnik.uloga],
  );

  // Zajednički podaci i funkcije
  const { omiljeni, rezervacije, ucitavanjeRez, greskaRez, ukloniOmiljeni } =
    useProfileCommonData(null, aktivnaTab);

  // Sadržaj pojedinih tabova
  const content: Partial<Record<ProfileTab, ReactNode>> = {
    rezervacije: (
      <ProfileReservations
        rezervacije={rezervacije}
        ucitavanje={ucitavanjeRez}
        greska={greskaRez}
      />
    ),

    omiljeni: (
      <ProfileFavorites omiljeni={omiljeni} onRemove={ukloniOmiljeni} />
    ),

    ...additionalContent,
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background-accent px-3 py-4 sm:px-6 sm:py-6">
      <main
        className={`mx-auto w-full ${
          korisnik.uloga === "User" ? "max-w-[900px]" : "max-w-[1100px]"
        }`}
      >
        <ProfileHeader korisnik={korisnik} onEdit={onEdit} />

        <ProfileContent
          uloga={korisnik.uloga}
          aktivnaTab={aktivnaTab}
          onTabChange={setAktivnaTab}
          content={content}
        />
      </main>
    </div>
  );
}
