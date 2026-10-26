import { Link } from "react-router-dom";
import type { OmiljeniObjekt } from "../../hooks/useProfileCommonData";

interface ProfileFavoritesProps {
  omiljeni: OmiljeniObjekt[];
  onRemove: (id: number) => void;
}

export default function ProfileFavorites({
  omiljeni,
  onRemove,
}: ProfileFavoritesProps) {
  return (
    <section className="sport-card p-5 sm:p-7">
      <h2 className="mb-5 text-card-heading text-text-primary">
        ❤️ Omiljeni objekti
      </h2>

      {omiljeni.length === 0 ? (
        <div className="p-8 text-center text-text-muted sm:p-10">
          <div className="mb-3 text-5xl">❤️</div>

          <p className="text-body">Nemate omiljenih objekata.</p>

          <Link
            to="/"
            className="mt-3 inline-block font-semibold text-primary hover:text-primary-hover"
          >
            Pronađi teren →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3.5">
          {omiljeni.map((objekt) => (
            <article
              key={objekt.id}
              className="relative rounded-card border border-border-default p-5 transition-colors hover:border-primary-border"
            >
              <Link to={`/objekt/${objekt.id}`} className="block pr-6">
                <h3 className="mb-1.5 text-subsection-heading text-text-primary hover:text-primary">
                  {objekt.naziv}
                </h3>

                <p className="text-body-sm text-text-secondary">
                  {objekt.adresa}
                </p>
              </Link>

              <button
                type="button"
                onClick={() => onRemove(objekt.id)}
                aria-label={`Ukloni ${objekt.naziv} iz omiljenih`}
                title="Ukloni iz omiljenih"
                className="absolute right-3 top-3 flex size-7 cursor-pointer items-center justify-center rounded-full border border-danger-border bg-danger-soft text-sm text-danger transition-opacity hover:opacity-70"
              >
                ✕
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
