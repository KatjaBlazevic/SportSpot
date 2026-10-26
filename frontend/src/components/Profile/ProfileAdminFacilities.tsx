import type { AdminFacility } from "../../hooks/useProfileAdminFacilities";

interface ProfileAdminFacilitiesProps {
  objekti: AdminFacility[];
  ucitavanje: boolean;
  greska: string | null;
  akcijaId: number | null;
  onAdd: () => void;
  onEdit: (objekt: AdminFacility) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onConfirmDelete: (id: number) => void;
  onRejectDelete: (id: number) => void;
  onManageTerms: (id: number, naziv: string) => void;
}

function getStatusLabel(status: string) {
  if (status === "Pending") return "⏳ Na čekanju";
  if (status === "PendingDelete") return "🗑️ Čeka brisanje";
  return "✅ Aktivan";
}

function getStatusClass(status: string) {
  if (status === "Pending") return "badge-warning";
  if (status === "PendingDelete") return "badge-danger";
  return "badge-success";
}

function getFacilityClass(status: string) {
  if (status === "Pending") {
    return "border-warning bg-warning-soft";
  }

  if (status === "PendingDelete") {
    return "border-danger-border bg-danger-soft";
  }

  return "border-border-default bg-surface";
}

function getPriority(status: string) {
  if (status === "Pending") return 0;
  if (status === "PendingDelete") return 1;
  return 2;
}

export default function ProfileAdminFacilities({
  objekti,
  ucitavanje,
  greska,
  akcijaId,
  onAdd,
  onEdit,
  onDelete,
  onApprove,
  onConfirmDelete,
  onRejectDelete,
  onManageTerms,
}: ProfileAdminFacilitiesProps) {
  const pendingCount = objekti.filter(
    (objekt) => objekt.status_objekta === "Pending",
  ).length;

  const pendingDeleteCount = objekti.filter(
    (objekt) => objekt.status_objekta === "PendingDelete",
  ).length;

  const sortiraniObjekti = [...objekti].sort(
    (a, b) => getPriority(a.status_objekta) - getPriority(b.status_objekta),
  );

  return (
    <section className="sport-card p-5 sm:p-7">
      {/* Zaglavlje */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-card-heading text-text-primary">
            Objekti ({objekti.length})
          </h2>

          {pendingCount > 0 && (
            <span className="badge-warning rounded-control px-2.5 py-1 text-xs font-semibold">
              {pendingCount} na čekanju
            </span>
          )}

          {pendingDeleteCount > 0 && (
            <span className="badge-danger rounded-control px-2.5 py-1 text-xs font-semibold">
              {pendingDeleteCount} čeka brisanje
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          + Dodaj objekt
        </button>
      </div>

      {/* Greška */}
      {greska && (
        <p
          role="alert"
          className="mb-4 rounded-control bg-danger-soft p-3 text-body-sm text-danger"
        >
          {greska}
        </p>
      )}

      {/* Učitavanje ili prikaz objekata */}
      {ucitavanje ? (
        <p className="p-10 text-center text-text-secondary">
          Učitavam objekte...
        </p>
      ) : sortiraniObjekti.length === 0 ? (
        <div className="p-10 text-center text-text-muted">
          <div className="mb-3 text-5xl">🏟️</div>
          <p>Nema objekata za prikaz.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortiraniObjekti.map((objekt) => {
            const isProcessing = akcijaId === objekt.id;

            return (
              <article
                key={objekt.id}
                className={`rounded-card border p-4 ${getFacilityClass(
                  objekt.status_objekta,
                )}`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  {/* Slika objekta */}
                  {objekt.slikaUrl && (
                    <img
                      src={objekt.slikaUrl}
                      alt={`Sportski objekt ${objekt.naziv}`}
                      className="h-14 w-[72px] shrink-0 rounded-control object-cover"
                    />
                  )}

                  {/* Podaci objekta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`/objekt/${objekt.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-text-primary hover:text-primary"
                      >
                        {objekt.naziv}
                        <span className="ml-1 text-xs text-primary">↗</span>
                      </a>

                      <span
                        className={`rounded-control px-2 py-1 text-xs font-bold ${getStatusClass(
                          objekt.status_objekta,
                        )}`}
                      >
                        {getStatusLabel(objekt.status_objekta)}
                      </span>
                    </div>

                    <p className="mt-1 text-body-sm text-text-secondary">
                      {objekt.adresa}, {objekt.kvart}
                    </p>

                    <p className="mt-1 text-body-sm text-text-muted">
                      Vlasnik: {objekt.vlasnik || "—"}
                      {" · "}
                      Klub: {objekt.nazivKluba || "—"}
                      {" · "}
                      {objekt.sportovi || "bez sportova"}
                    </p>
                  </div>

                  {/* Akcije */}
                  <div className="flex flex-wrap items-center gap-2">
                    {objekt.status_objekta === "Pending" && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onApprove(objekt.id)}
                        className="cursor-pointer rounded-control bg-success px-3 py-2 text-body-sm font-semibold text-text-inverse hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ✓ Odobri
                      </button>
                    )}

                    {objekt.status_objekta === "PendingDelete" && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onConfirmDelete(objekt.id)}
                          className="btn-danger px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          🗑️ Potvrdi brisanje
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onRejectDelete(objekt.id)}
                          className="btn-secondary px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ↩ Odbij
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onManageTerms(objekt.id, objekt.naziv)}
                      className="btn-secondary px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Termini
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onEdit(objekt)}
                      className="btn-secondary px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Uredi
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onDelete(objekt.id)}
                      className="btn-danger px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Obriši
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
