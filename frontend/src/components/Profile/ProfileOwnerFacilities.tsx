import { Link } from "react-router-dom";

export interface MojObjekt {
  ID_objekta: number;
  Naziv_objekta: string;
  Adresa: string;
  Kvart: string;
  Kapacitet: number | null;
  Opis: string | null;
  sportovi: string | null;
  Slika_url: string | null;
  Status_objekta: string;
}

interface ProfileOwnerFacilitiesProps {
  objekti: MojObjekt[];
  ucitavanje: boolean;
  greska?: string | null;
  onAdd: () => void;
  onEdit: (objekt: MojObjekt) => void;
  onDelete: (id: number, naziv: string) => void;
}

function getStatusClass(status: string) {
  if (status === "Pending") return "badge-warning";
  if (status === "PendingDelete") return "badge-danger";
  return "badge-success";
}

function getStatusLabel(status: string) {
  if (status === "Pending") return "⏳ Na čekanju";
  if (status === "PendingDelete") return "🗑️ Čeka brisanje";
  return "✅ Aktivan";
}

export default function ProfileOwnerFacilities({
  objekti,
  ucitavanje,
  greska,
  onAdd,
  onEdit,
  onDelete,
}: ProfileOwnerFacilitiesProps) {
  return (
    <section className="sport-card p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-card-heading text-text-primary">🏟️ Moji objekti</h2>

        <button
          type="button"
          onClick={onAdd}
          className="btn-secondary px-4 py-2.5 text-sm"
        >
          + Dodaj objekt
        </button>
      </div>

      {ucitavanje ? (
        <p className="p-10 text-center text-text-secondary">Učitavam...</p>
      ) : greska ? (
        <p
          role="alert"
          className="rounded-control bg-danger-soft p-4 text-danger"
        >
          {greska}
        </p>
      ) : objekti.length === 0 ? (
        <div className="p-10 text-center text-text-muted">
          <div className="mb-3 text-5xl">🏟️</div>
          <p>Nemate dodanih objekata.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {objekti.map((objekt) => (
            <article
              key={objekt.ID_objekta}
              className="flex flex-wrap items-start justify-between gap-3 rounded-card border border-border-default p-5"
            >
              <Link
                to={`/objekt/${objekt.ID_objekta}`}
                className="min-w-0 flex-1"
              >
                <h3 className="text-subsection-heading text-text-primary hover:text-primary">
                  {objekt.Naziv_objekta}
                </h3>

                <span
                  className={`mt-1 inline-block rounded-control px-2.5 py-1 text-xs font-bold ${getStatusClass(
                    objekt.Status_objekta,
                  )}`}
                >
                  {getStatusLabel(objekt.Status_objekta)}
                </span>

                <p className="mt-2 text-body-sm text-text-secondary">
                  {objekt.Adresa}, {objekt.Kvart}
                </p>

                {objekt.sportovi && (
                  <p className="mt-1 text-body-sm text-primary">
                    {objekt.sportovi}
                  </p>
                )}

                {objekt.Slika_url && (
                  <img
                    src={objekt.Slika_url}
                    alt={`Sportski objekt ${objekt.Naziv_objekta}`}
                    className="mt-2 h-14 w-20 rounded-control border border-border-default object-cover"
                  />
                )}
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(objekt)}
                  className="cursor-pointer rounded-control bg-primary-soft px-4 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-border"
                >
                  Uredi
                </button>

                {objekt.Status_objekta === "PendingDelete" ? (
                  <span className="rounded-control px-3 py-2 text-[13px] font-semibold badge-warning">
                    ⏳ Čeka brisanje
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(objekt.ID_objekta, objekt.Naziv_objekta)
                    }
                    className="cursor-pointer rounded-control px-4 py-2 text-[13px] font-semibold badge-danger transition-opacity hover:opacity-80"
                  >
                    Obriši
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
