
type HomeFiltersProps = {
  filterOtvoren: boolean;

  odabraniSportovi: string[];
  odabraniKvart: string;
  odabraniDatum: string;
  odabraniPeriod: string;
  cijenaMin: string;
  cijenaMax: string;
  samoBesplatni: boolean;

  sviKvartovi: string[];
  aktivniFilteri: boolean;

  toggleSport: (sport: string) => void;

  setOdabraniSportovi: (value: string[]) => void;
  setOdabraniKvart: (value: string) => void;
  setOdabraniDatum: (value: string) => void;
  setOdabraniPeriod: (value: string) => void;
  setCijenaMin: (value: string) => void;
  setCijenaMax: (value: string) => void;
  setSamoBesplatni: (value: boolean) => void;

  onApply: () => void;
};

const SVE_SPORTOVI = [
  "Nogomet",
  "Mali nogomet",
  "Košarka",
  "Tenis",
  "Padel",
  "Odbojka",
  "Vaterpolo",
  "Boćanje",
  "Stolni tenis",
  "Plivanje",
];

const PERIODI = [
  { label: "Jutro (06:00 - 12:00)", value: "jutro" },
  {
    label: "Poslijepodne (12:00 - 18:00)",
    value: "poslijepodne",
  },
  { label: "Večer (18:00 - 24:00)", value: "vecer" },
];

const SPORT_IKONE: Record<string, string> = {
  Nogomet: "⚽",
  "Mali nogomet": "⚽",
  Košarka: "🏀",
  Tenis: "🎾",
  Padel: "🏓",
  Odbojka: "🏐",
  Vaterpolo: "🤽",
  Boćanje: "🎳",
  "Stolni tenis": "🏓",
  Plivanje: "🏊",
};

const sectionLabelClass =
  "mb-2 block text-section-label text-text-muted";

const fieldClass =
  "w-full min-w-0 rounded-lg border border-border-default " +
  "bg-surface px-2.5 py-2 text-label font-normal " +
  "text-text-primary outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/10";

export default function HomeFilters({
  filterOtvoren,
  odabraniSportovi,
  odabraniKvart,
  odabraniDatum,
  odabraniPeriod,
  cijenaMin,
  cijenaMax,
  samoBesplatni,
  sviKvartovi,
  aktivniFilteri,
  toggleSport,
  setOdabraniSportovi,
  setOdabraniKvart,
  setOdabraniDatum,
  setOdabraniPeriod,
  setCijenaMin,
  setCijenaMax,
  setSamoBesplatni,
  onApply,
}: HomeFiltersProps) {
  const handleReset = () => {
    setOdabraniSportovi([]);
    setOdabraniKvart("Svi kvartovi");
    setOdabraniDatum("");
    setOdabraniPeriod("");
    setCijenaMin("");
    setCijenaMax("");
    setSamoBesplatni(false);
  };

  return (
    <aside
      className={`
        home-filter-aside
        ${filterOtvoren ? "home-filter-otvoren" : ""}
        sticky top-20 z-2
        max-h-[calc(100vh-100px)]
        overflow-y-auto
        rounded-card
        border border-primary-border
        bg-surface
        px-3.5 py-4
        shadow-sport-card
        [scrollbar-width:thin]
        [scrollbar-color:#BFDBFE_transparent]
      `}
    >
      {/* NASLOV */}
      <div className="mb-4">
        <h2 className="text-subsection-heading text-text-primary">
          Filteri
        </h2>
        <p className="text-helper">
          Prilagodite pretragu
        </p>
      </div>

      {/* SPORTOVI */}
      <section className="mb-4">
        <h3 className={sectionLabelClass}>Sportovi</h3>

        <div className="grid grid-cols-2 gap-1">
          {SVE_SPORTOVI.map((sport) => {
            const aktivan = odabraniSportovi.includes(sport);

            return (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                aria-pressed={aktivan}
                className={`
                  flex min-w-0 items-center gap-1
                  overflow-hidden whitespace-nowrap
                  rounded-lg border px-2 py-1.5
                  text-left text-[11px]
                  cursor-pointer transition-colors
                  ${
                    aktivan
                      ? "border-primary bg-primary-soft font-bold text-primary"
                      : "border-border-default bg-transparent font-normal text-text-primary hover:bg-surface-soft"
                  }
                `}
              >
                <span aria-hidden="true">
                  {SPORT_IKONE[sport] ?? "🏃"}
                </span>
                <span className="truncate">{sport}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* TERMINI */}
      <section className="mb-4">
        <h3 className={sectionLabelClass}>Termini</h3>

        <div className="flex flex-col gap-2">
          <input
            type="date"
            aria-label="Datum termina"
            value={odabraniDatum}
            onChange={(e) => setOdabraniDatum(e.target.value)}
            className={fieldClass}
          />

          <select
            aria-label="Period termina"
            value={odabraniPeriod}
            onChange={(e) => setOdabraniPeriod(e.target.value)}
            className={fieldClass}
          >
            <option value="">Odaberi period</option>
            {PERIODI.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* LOKACIJA */}
      <section className="mb-4">
        <h3 className={sectionLabelClass}>Lokacija</h3>

        <select
          aria-label="Kvart"
          value={odabraniKvart}
          onChange={(e) => setOdabraniKvart(e.target.value)}
          className={fieldClass}
        >
          {sviKvartovi.map((kvart) => (
            <option key={kvart} value={kvart}>
              {kvart === "Svi kvartovi"
                ? "Rijeka - Svi kvartovi"
                : kvart}
            </option>
          ))}
        </select>
      </section>

      {/* CIJENA */}
      <section className="mb-4">
        <h3 className={sectionLabelClass}>Cijena (€/h)</h3>

        <label className="mb-2 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={samoBesplatni}
            onChange={(e) => {
              const checked = e.target.checked;
              setSamoBesplatni(checked);

              if (checked) {
                setCijenaMin("");
                setCijenaMax("");
              }
            }}
            className="h-3.5 w-3.5 cursor-pointer accent-primary"
          />

          <span className="text-label font-medium text-text-primary">
            Samo besplatni
          </span>
        </label>

        {!samoBesplatni && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              placeholder="Od (€)"
              aria-label="Minimalna cijena"
              value={cijenaMin}
              onChange={(e) => setCijenaMin(e.target.value)}
              className={fieldClass}
            />

            <input
              type="number"
              min={0}
              placeholder="Do (€)"
              aria-label="Maksimalna cijena"
              value={cijenaMax}
              onChange={(e) => setCijenaMax(e.target.value)}
              className={fieldClass}
            />
          </div>
        )}
      </section>

      {/* AKCIJE */}
      <div>
        <button
          type="button"
          onClick={onApply}
          className="
            w-full rounded-full
            bg-brand-gradient
            px-4 py-2.5
            text-body-sm font-bold text-white
            shadow-sport-primary
            cursor-pointer transition-opacity
            hover:opacity-90
          "
        >
          Primijeni filtere
        </button>

        {aktivniFilteri && (
          <button
            type="button"
            onClick={handleReset}
            className="
              mt-2 w-full rounded-full
              border border-border-default
              bg-transparent px-4 py-2
              text-label font-medium text-text-secondary
              cursor-pointer transition-colors
              hover:bg-surface-soft
            "
          >
            Poništi filtere
          </button>
        )}
      </div>
    </aside>
  );
}
