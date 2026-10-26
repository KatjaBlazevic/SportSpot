import type { OwnerStatisticsData } from "../../hooks/useProfileOwnerStatistics";

interface ProfileOwnerStatisticsProps {
  statistika: OwnerStatisticsData | null;
  ucitavanje: boolean;
  greska: string | null;
  ukupnoRezervacija: number;
  ukupniPrihod: number;
  ukupnoTermina: number;
  popunjenost: number;
  maxRezervacija: number;
}

function formatirajMjesec(mjesec: string) {
  const [godina, mjesecBroj] = mjesec.split("-");

  const nazivi = [
    "Sij",
    "Velj",
    "Ožu",
    "Tra",
    "Svi",
    "Lip",
    "Srp",
    "Kol",
    "Ruj",
    "Lis",
    "Stu",
    "Pro",
  ];

  const index = Number(mjesecBroj) - 1;

  return `${nazivi[index] ?? mjesec} ${godina}`;
}

export default function ProfileOwnerStatistics({
  statistika,
  ucitavanje,
  greska,
  ukupnoRezervacija,
  ukupniPrihod,
  ukupnoTermina,
  popunjenost,
  maxRezervacija,
}: ProfileOwnerStatisticsProps) {
  if (ucitavanje) {
    return (
      <div className="sport-card p-10 text-center text-text-secondary">
        <div className="mb-3 text-5xl">📊</div>
        <p>Učitavam statistiku...</p>
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

  if (!statistika || statistika.poObjektima.length === 0) {
    return (
      <div className="sport-card p-10 text-center text-text-muted">
        <div className="mb-3 text-5xl">📊</div>
        <p>Nemate još podataka za prikaz statistike.</p>
      </div>
    );
  }

  const kartice = [
    {
      ikona: "📅",
      label: "Ukupno rezervacija",
      vrijednost: ukupnoRezervacija,
      boja: "text-primary",
      obrub: "border-primary",
    },
    {
      ikona: "💰",
      label: "Ukupni prihod",
      vrijednost: `${ukupniPrihod.toFixed(2)} €`,
      boja: "text-success",
      obrub: "border-success",
    },
    {
      ikona: "🏟️",
      label: "Ukupno termina",
      vrijednost: ukupnoTermina,
      boja: "text-chart-purple",
      obrub: "border-chart-purple",
    },
    {
      ikona: "📈",
      label: "Popunjenost",
      vrijednost: `${popunjenost}%`,
      boja: "text-warning",
      obrub: "border-warning",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Glavne statističke kartice */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartice.map((kartica) => (
          <article
            key={kartica.label}
            className={`sport-card border-t-4 p-5 ${kartica.obrub}`}
          >
            <div className="mb-2 text-[28px]">{kartica.ikona}</div>

            <div className={`text-[26px] font-extrabold ${kartica.boja}`}>
              {kartica.vrijednost}
            </div>

            <p className="mt-1 text-[13px] text-text-secondary">
              {kartica.label}
            </p>
          </article>
        ))}
      </div>

      {/* Rezervacije po mjesecima */}
      {statistika.poMjesecima.length > 0 && (
        <section className="sport-card p-5 sm:p-7">
          <h2 className="mb-6 text-card-heading text-text-primary">
            📅 Rezervacije po mjesecima (zadnjih 6 mj.)
          </h2>

          <div className="flex h-48 items-end gap-3">
            {statistika.poMjesecima.map((mjesec) => {
              const visina = Math.max(
                (mjesec.brojRezervacija / maxRezervacija) * 120,
                4,
              );

              return (
                <div
                  key={mjesec.mjesec}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-bold text-primary">
                    {mjesec.brojRezervacija}
                  </span>

                  <div
                    className="w-full rounded-t-md bg-primary transition-[height] duration-300"
                    style={{ height: `${visina}px` }}
                    title={`${mjesec.brojRezervacija} rezervacija`}
                  />

                  <span className="text-center text-[11px] text-text-secondary">
                    {formatirajMjesec(mjesec.mjesec)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Statistika pojedinih objekata */}
      <section className="sport-card p-5 sm:p-7">
        <h2 className="mb-5 text-card-heading text-text-primary">
          🏟️ Po objektima
        </h2>

        <div className="flex flex-col gap-3">
          {statistika.poObjektima.map((objekt) => (
            <article
              key={objekt.id}
              className="rounded-control border border-border-default p-4"
            >
              <h3 className="mb-2 font-bold text-text-primary">
                {objekt.naziv}
              </h3>

              <div className="flex flex-wrap gap-5 text-body-sm text-text-secondary">
                <span>
                  ✅ Zauzeto:{" "}
                  <strong className="text-text-primary">
                    {objekt.zauzeti}
                  </strong>
                </span>

                <span>
                  🔓 Slobodno:{" "}
                  <strong className="text-text-primary">
                    {objekt.slobodni}
                  </strong>
                </span>

                <span>
                  💰 Prihod:{" "}
                  <strong className="text-success">
                    {objekt.ukupniPrihod.toFixed(2)} €
                  </strong>
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
