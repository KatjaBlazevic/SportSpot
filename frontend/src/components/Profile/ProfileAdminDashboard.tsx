import type {
  AdminDashboardData,
  AdminDashboardExtra,
} from "../../hooks/useProfileAdminDashboard";

interface ProfileAdminDashboardProps {
  dashboard: AdminDashboardData | null;
  dashboardExtra: AdminDashboardExtra | null;
  ucitavanje: boolean;
  greska: string | null;
}

export default function ProfileAdminDashboard({
  dashboard,
  dashboardExtra,
  ucitavanje,
  greska,
}: ProfileAdminDashboardProps) {
  if (ucitavanje) {
    return (
      <div className="sport-card p-10 text-center text-text-secondary">
        Učitavam dashboard...
      </div>
    );
  }

  if (greska) {
    return (
      <div role="alert" className="sport-card p-8 text-center text-danger">
        {greska}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="sport-card p-10 text-center text-text-muted">
        Nema dostupnih podataka za dashboard.
      </div>
    );
  }

  const glavneKartice = [
    {
      label: "Korisnici",
      vrijednost: dashboard.ukupnoKorisnika,
      ikona: "👤",
      boja: "text-chart-blue",
      pozadina: "bg-primary-soft",
    },
    {
      label: "Aktivni objekti",
      vrijednost: dashboard.ukupnoObjekta,
      ikona: "🏟️",
      boja: "text-chart-green",
      pozadina: "bg-success-soft",
    },
    {
      label: "Rezervacije",
      vrijednost: dashboard.ukupnoRezervacija,
      ikona: "📅",
      boja: "text-chart-indigo",
      pozadina: "bg-primary-soft",
    },
    {
      label: "Recenzije",
      vrijednost: dashboard.ukupnoRecenzija,
      ikona: "⭐",
      boja: "text-chart-amber",
      pozadina: "bg-warning-soft",
    },
  ];

  const dodatneKartice = [
    {
      label: "Vlasnici",
      vrijednost: dashboard.ukupnoVlasnika,
      ikona: "🏢",
      boja: "text-chart-purple",
      pozadina: "bg-primary-soft",
    },
    {
      label: "Klubovi",
      vrijednost: dashboard.ukupnoKlubova,
      ikona: "⚽",
      boja: "text-chart-cyan",
      pozadina: "bg-primary-soft",
    },
    {
      label: "Na čekanju odobrenja",
      vrijednost: dashboard.ukupnoPending,
      ikona: "⏳",
      boja: "text-danger",
      pozadina: "bg-danger-soft",
    },
  ];

  const statistike = dashboardExtra
    ? [
        {
          label: "Termini danas",
          vrijednost: dashboardExtra.stats.danas,
          opis: "zauzeto",
          boja: "text-chart-blue",
          pozadina: "bg-primary-soft",
        },
        {
          label: "Termini ovaj tjedan",
          vrijednost: dashboardExtra.stats.ovajTjedan,
          opis: "zauzeto",
          boja: "text-success",
          pozadina: "bg-success-soft",
        },
        {
          label: "Termini ovaj mjesec",
          vrijednost: dashboardExtra.stats.ovajMjesec,
          opis: "zauzeto",
          boja: "text-text-primary",
          pozadina: "bg-surface-soft",
        },
        {
          label: "Prihod ovaj mjesec",
          vrijednost: `${dashboardExtra.stats.prihodMjesec} €`,
          opis: "ukupno",
          boja: "text-warning",
          pozadina: "bg-warning-soft",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Glavne statističke kartice */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {glavneKartice.map((kartica) => (
          <article
            key={kartica.label}
            className="sport-card flex items-center gap-4 p-5"
          >
            <div
              className={`flex size-[52px] shrink-0 items-center justify-center rounded-control text-2xl ${kartica.pozadina}`}
            >
              {kartica.ikona}
            </div>

            <div className="min-w-0">
              <p className={`text-[28px] font-extrabold ${kartica.boja}`}>
                {kartica.vrijednost}
              </p>

              <p className="mt-1 text-[13px] text-text-secondary">
                {kartica.label}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Dodatne statističke kartice */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dodatneKartice.map((kartica) => (
          <article
            key={kartica.label}
            className="sport-card flex items-center gap-4 p-5"
          >
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-control text-xl ${kartica.pozadina}`}
            >
              {kartica.ikona}
            </div>

            <div className="min-w-0">
              <p className={`text-2xl font-extrabold ${kartica.boja}`}>
                {kartica.vrijednost}
              </p>

              <p className="mt-1 text-[13px] text-text-secondary">
                {kartica.label}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Donji dio dashboarda */}
      {dashboardExtra && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Top objekti */}
          <section className="sport-card p-5 sm:p-6">
            <h2 className="mb-4 text-card-heading text-text-primary">
              🏆 Top objekti po rezervacijama
            </h2>

            <div className="flex flex-col gap-2.5">
              {dashboardExtra.topObjekti.length === 0 ? (
                <p className="text-body-sm text-text-muted">
                  Nema podataka o rezervacijama objekata.
                </p>
              ) : (
                dashboardExtra.topObjekti.map((objekt, index) => (
                  <div
                    key={`${objekt.naziv}-${index}`}
                    className={`flex items-center gap-3 rounded-control border p-3 ${
                      index === 0
                        ? "border-warning-soft bg-warning-soft"
                        : "border-border-light bg-surface-soft"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                        index === 0
                          ? "bg-chart-amber text-text-inverse"
                          : "bg-border-default text-text-primary"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-semibold text-text-primary">
                        {objekt.naziv}
                      </p>

                      <p className="text-xs text-text-muted">{objekt.kvart}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-body-sm font-bold text-chart-indigo">
                        {objekt.brojRezervacija} rez.
                      </p>

                      {objekt.ocjena != null && (
                        <p className="text-xs text-chart-amber">
                          ⭐ {objekt.ocjena}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Statistika rezervacija */}
          <section className="sport-card p-5 sm:p-6">
            <h2 className="mb-4 text-card-heading text-text-primary">
              📈 Statistike rezervacija
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {statistike.map((statistika) => (
                <article
                  key={statistika.label}
                  className={`rounded-card p-4 ${statistika.pozadina}`}
                >
                  <p className="text-section-label text-text-secondary">
                    {statistika.label}
                  </p>

                  <p
                    className={`mt-1 text-[28px] font-extrabold ${statistika.boja}`}
                  >
                    {statistika.vrijednost}
                  </p>

                  <p className="text-xs text-text-muted">{statistika.opis}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
