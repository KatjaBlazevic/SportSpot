
type HomeResultsHeaderProps = {
  ucitavanje: boolean;
  brojRezultata: number;
  searchQuery: string;
  greska: string | null;
};

export default function HomeResultsHeader({
  ucitavanje,
  brojRezultata,
  searchQuery,
  greska,
}: HomeResultsHeaderProps) {
  // TODO: Prilagoditi tekst broju rezultata:
  // 1 teren, 2–4 terena, 5+ terena.

  return (
    <div className="mb-4">
      <div className="mb-4">
        <h1 className="text-section-heading font-extrabold text-text-primary">
          {ucitavanje
            ? "Učitavanje..."
            : `Pronađeno: ${brojRezultata} terena`}
        </h1>

        <p className="text-label font-normal text-text-muted">
          Rezultati za: Rijeka, Hrvatska
          {searchQuery && ` · "${searchQuery}"`}
        </p>
      </div>

      {greska && (
        <div
          role="alert"
          className="
            rounded-control
            border border-danger-border
            bg-danger-soft
            px-4 py-3.5
            text-body-sm text-danger
          "
        >
          <span aria-hidden="true">⚠️ </span>
          {greska}
        </div>
      )}
    </div>
  );
}
