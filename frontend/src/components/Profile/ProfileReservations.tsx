import { Link } from "react-router-dom";
import type { Rezervacija } from "../../hooks/useProfileCommonData";

interface ProfileReservationsProps {
  rezervacije: Rezervacija[];
  ucitavanje: boolean;
  greska: string | null;
}

function formatirajDatum(datum: string) {
  const d = new Date(datum);

  const mjeseci = [
    "sij",
    "velj",
    "ožu",
    "tra",
    "svi",
    "lip",
    "srp",
    "kol",
    "ruj",
    "lis",
    "stu",
    "pro",
  ];

  return `${d.getDate()}. ${mjeseci[d.getMonth()]} ${d.getFullYear()}.`;
}

function statusKlasa(status: string) {
  if (status === "Potvrđeno") return "badge-success";
  if (status === "Odbijeno") return "badge-danger";
  return "badge-warning";
}

export default function ProfileReservations({
  rezervacije,
  ucitavanje,
  greska,
}: ProfileReservationsProps) {
  return (
    <section className="sport-card p-5 sm:p-7">
      <h2 className="mb-5 text-card-heading text-text-primary">
        📅 Moje rezervacije
      </h2>

      {ucitavanje ? (
        <p className="p-10 text-center text-text-secondary">Učitavam...</p>
      ) : greska ? (
        <p
          role="alert"
          className="rounded-control bg-danger-soft p-4 text-danger"
        >
          {greska}
        </p>
      ) : rezervacije.length === 0 ? (
        <div className="p-8 text-center text-text-muted sm:p-10">
          <div className="mb-3 text-5xl">📅</div>

          <p className="text-body">Nemate niti jednu rezervaciju.</p>

          <Link
            to="/"
            className="mt-3 inline-block font-semibold text-primary hover:text-primary-hover"
          >
            Pronađi teren →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {rezervacije.map((rez) => (
            <article
              key={rez.ID_termina}
              className="rounded-card border border-border-default p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link
                  to={`/objekt/${rez.ID_objekta}`}
                  className="min-w-0 flex-1"
                >
                  <h3 className="mb-1 text-subsection-heading text-text-primary hover:text-primary">
                    {rez.Naziv_objekta}
                  </h3>

                  <p className="text-body-sm text-text-secondary">
                    {rez.Adresa}
                  </p>

                  {rez.Naziv_kluba && (
                    <p className="mt-1 text-body-sm text-primary">
                      🏟️ {rez.Naziv_kluba}
                    </p>
                  )}
                </Link>

                <span
                  className={`shrink-0 rounded-control px-3 py-1.5 text-xs font-bold ${statusKlasa(rez.Status)}`}
                >
                  {rez.Status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2.5 text-body-sm text-text-secondary">
                <span>📆 {formatirajDatum(rez.Datum)}</span>

                <span>
                  ⏰ {rez.vrijeme_pocetka} - {rez.vrijeme_kraja}
                </span>

                <span className="font-bold text-primary">{rez.Cijena} €</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
