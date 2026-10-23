
import { Link } from "react-router-dom";

type FacilityHeaderProps = {
  name: string;
  sports: string[];
  isAuthenticated: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function FacilityHeader({
  name,
  sports,
  isAuthenticated,
  isFavorite,
  onToggleFavorite,
}: FacilityHeaderProps) {
  return (
    <header className="relative mb-8 text-center sm:mb-12">
      <h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase sm:text-5xl">
        {name}
      </h1>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute top-0 right-0 cursor-pointer text-4xl transition-transform hover:scale-110"
          title={
            isFavorite
              ? "Ukloni iz omiljenih"
              : "Dodaj u omiljene"
          }
          aria-label={
            isFavorite
              ? "Ukloni iz omiljenih"
              : "Dodaj u omiljene"
          }
          aria-pressed={isFavorite}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      ) : (
        <Link
          to="/prijava"
          className="absolute top-0 right-0 text-4xl transition-transform hover:scale-110"
          title="Prijavi se da spremiš omiljene"
          aria-label="Prijavi se da spremiš omiljene"
        >
          🤍
        </Link>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {sports.map((sport) => (
          <span
            key={sport}
            className="rounded-full bg-primary-soft px-4 py-1 text-[10px] font-black text-primary uppercase"
          >
            {sport}
          </span>
        ))}
      </div>
    </header>
  );
}
