import { Link } from "react-router-dom";
import type { SportsFacility } from "../types/sportsFacility";

type ObjectCardProps = {
  facility: SportsFacility;
};

function SportIcon({ sport }: { sport: string }) {
  const icons: Record<string, string> = {
    Tenis: "🎾",
    Padel: "🏓",
    Nogomet: "⚽",
    "Mali nogomet": "⚽",
    Košarka: "🏀",
    Odbojka: "🏐",
    Plivanje: "🏊",
    Vaterpolo: "🤽",
    Boćanje: "🎳",
    "Stolni tenis": "🏓",
  };

  return (
    <span className="text-[13px]" aria-hidden="true">
      {icons[sport] ?? "🏃"}
    </span>
  );
}

// TODO: Ako se kartica bude koristila na drugim stranicama,
// provjeriti trebaju li različite varijante prikaza.

// TODO: Tijekom mobilnog refaktoriranja zamijeniti postojeće
// responsive CSS klase Tailwind breakpoint klasama.

export default function ObjectCard({ facility }: ObjectCardProps) {
  const availableSlots = facility.termini.filter(
    (slot) => slot.status === "Slobodan",
  );

  const hasAvailableSlots = availableSlots.length > 0;

  return (
    <article
      className="
        mb-4 overflow-hidden
        rounded-card border border-primary-border
        bg-surface shadow-sport-card
        transition-[box-shadow,transform] duration-200
        hover:-translate-y-0.5
        hover:shadow-sport-elevated
      "
    >
      <div className="objekt-kartica-inner flex gap-4 p-4">
        <div
          className="
            objekt-kartica-slika
            flex h-22.5 w-27.5 shrink-0
            items-center justify-center
            overflow-hidden rounded-control
            bg-linear-to-br from-primary-soft to-background-accent
            text-[32px]
          "
        >
          {facility.slikaUrl ? (
            <img
              src={facility.slikaUrl}
              alt={facility.naziv}
              className="h-full w-full object-cover"
            />
          ) : facility.sportovi[0] ? (
            <SportIcon sport={facility.sportovi[0]} />
          ) : (
            <span aria-hidden="true">🏟️</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link to={`/objekt/${facility.id}`} className="no-underline">
            <h3
              className="
                text-[17px] font-bold text-primary
                transition-colors hover:text-primary-hover
              "
            >
              {facility.naziv}
            </h3>
          </Link>

          <div
            className="
              mt-1 flex flex-wrap items-center
              gap-x-1.5 gap-y-1
              text-[13px] text-text-secondary
            "
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <span>{facility.kvart}, Rijeka</span>

            {facility.ocjena !== null && (
              <>
                <span className="ml-1.5">⭐ {facility.ocjena}</span>

                <span className="text-text-muted">
                  ({facility.brojRecenzija} recenzija)
                </span>
              </>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {facility.sportovi.map((sport) => (
              <span
                key={sport}
                className="
                  inline-flex items-center gap-1
                  rounded-full bg-primary-soft
                  px-2.5 py-1
                  text-label font-semibold text-primary
                "
              >
                <SportIcon sport={sport} />
                {sport}
              </span>
            ))}
          </div>
        </div>

        <div className="objekt-kartica-cijena shrink-0 text-right">
          <div
            className="
              text-[11px] font-medium uppercase
              tracking-wide text-text-muted
            "
          >
            Već od
          </div>

          {facility.cijenaOd === 0 ? (
            <div className="text-card-heading font-extrabold text-success">
              Besplatno
            </div>
          ) : (
            <div className="text-section-heading font-extrabold text-text-primary">
              {facility.cijenaOd}€
              <span className="text-[13px] font-medium text-text-secondary">
                /h
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className={`
          border-t border-border-light px-4 py-2.5
          ${hasAvailableSlots ? "bg-success-soft" : "bg-surface-soft"}
        `}
      >
        {hasAvailableSlots ? (
          <div
            className="
              flex items-center gap-1.5
              text-[13px] font-bold text-success
            "
          >
            <span
              aria-hidden="true"
              className="
                h-2 w-2 shrink-0 rounded-full
                bg-success
                shadow-[0_0_8px_color-mix(in_srgb,var(--color-success)_40%,transparent)]
              "
            />
            Dostupno slobodnih termina: {availableSlots.length}
          </div>
        ) : (
          <span className="text-[13px] italic text-text-muted">
            Trenutno nema slobodnih termina
          </span>
        )}
      </div>
    </article>
  );
}
