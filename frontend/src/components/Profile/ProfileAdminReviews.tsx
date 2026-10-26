import type { AdminReview } from "../../hooks/useProfileAdminReviews";

interface ProfileAdminReviewsProps {
  recenzije: AdminReview[];
  ucitavanje: boolean;
  greska: string | null;
  brisanjeId: string | null;
  onDelete: (idKorisnika: number, idObjekta: number) => void;
}

export default function ProfileAdminReviews({
  recenzije,
  ucitavanje,
  greska,
  brisanjeId,
  onDelete,
}: ProfileAdminReviewsProps) {
  return (
    <section className="sport-card p-5 sm:p-7">
      {/* Zaglavlje */}
      <div className="mb-5">
        <h2 className="text-card-heading text-text-primary">
          Recenzije ({recenzije.length})
        </h2>
      </div>

      {/* Poruka o grešci */}
      {greska && (
        <p
          role="alert"
          className="mb-4 rounded-control bg-danger-soft p-3 text-body-sm text-danger"
        >
          {greska}
        </p>
      )}

      {/* Učitavanje */}
      {ucitavanje ? (
        <p className="py-10 text-center text-text-secondary">
          Učitavam recenzije...
        </p>
      ) : recenzije.length === 0 ? (
        <div className="py-10 text-center text-text-muted">
          <p>Trenutačno nema recenzija za prikaz.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recenzije.map((recenzija) => {
            const reviewId = `${recenzija.idKorisnika}-${recenzija.idObjekta}`;
            const isDeleting = brisanjeId === reviewId;

            const datum = new Date(recenzija.datum);
            const formattedDate = Number.isNaN(datum.getTime())
              ? recenzija.datum
              : datum.toLocaleDateString("hr-HR");

            return (
              <article
                key={reviewId}
                className="rounded-control border border-border-default bg-surface p-4"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    {/* Korisnik, objekt i ocjena */}
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-text-primary">
                        {recenzija.ime} {recenzija.prezime}
                      </span>

                      <span className="text-body-sm text-text-secondary">
                        → {recenzija.nazivObjekta}
                      </span>

                      <span
                        className="text-body-sm"
                        role="img"
                        aria-label={`Ocjena ${recenzija.ocjena} od 5`}
                      >
                        {"⭐".repeat(
                          Math.max(
                            0,
                            Math.min(5, Math.trunc(recenzija.ocjena)),
                          ),
                        )}
                      </span>

                      <span className="text-body-sm text-text-muted">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Komentar */}
                    {recenzija.komentar && (
                      <p className="whitespace-pre-wrap break-words text-body-sm text-text-secondary">
                        {recenzija.komentar}
                      </p>
                    )}
                  </div>

                  {/* Brisanje */}
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(recenzija.idKorisnika, recenzija.idObjekta)
                    }
                    disabled={brisanjeId !== null}
                    className="btn-danger shrink-0 px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Brišem..." : "Obriši"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
