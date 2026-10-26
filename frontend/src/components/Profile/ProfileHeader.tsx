import type { Korisnik } from "../../context/AuthContextDef";

interface ProfileHeaderProps {
  korisnik: Korisnik;
  onEdit?: () => void;
}

export default function ProfileHeader({
  korisnik,
  onEdit,
}: ProfileHeaderProps) {
  const inicijali = korisnik.ime.charAt(0) + korisnik.prezime.charAt(0);

  return (
    <header className="bg-brand-gradient relative mb-6 overflow-hidden rounded-panel p-6 text-text-inverse sm:p-8">
      {/* Dekorativni krugovi */}
      <div className="pointer-events-none absolute -top-[50px] -right-[50px] size-[200px] rounded-full bg-surface/10" />
      <div className="pointer-events-none absolute -bottom-[30px] right-[100px] size-[100px] rounded-full bg-surface/5" />

      <div className="relative z-1 flex flex-wrap items-center gap-4">
        {/* Avatar */}
        <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-surface text-[28px] font-extrabold text-primary shadow-sport-elevated">
          {inicijali}
        </div>

        {/* Osnovni podaci */}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold text-text-inverse">
            {korisnik.ime} {korisnik.prezime}
          </h1>

          <p className="mt-1.5 break-all text-[13px] text-text-inverse/90">
            {korisnik.email}
          </p>

          {korisnik.uloga === "Admin" && (
            <p className="mt-1 text-sm font-semibold text-text-inverse/90">
              Administrator
            </p>
          )}
        </div>

        {/* Uređivanje profila */}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 cursor-pointer rounded-control bg-surface px-4 py-2.5 text-[13px] font-bold text-primary shadow-sport-elevated transition-colors hover:bg-primary-soft"
          >
            Uredi profil
          </button>
        )}
      </div>
    </header>
  );
}
