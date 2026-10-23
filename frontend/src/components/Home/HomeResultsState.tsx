
type HomeResultsStateProps = {
  state: "loading" | "empty";
};

export default function HomeResultsState({
  state,
}: HomeResultsStateProps) {
// TODO: Nakon refaktoriranja ObjektKartica komponente
// uskladiti loading skeleton s njezinim konačnim izgledom.
  if (state === "loading") {
    return (
      <div
        role="status"
        aria-label="Učitavanje sportskih objekata"
        className="space-y-4"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="
              h-32.5 rounded-card
              border border-primary-border
              bg-surface opacity-50
            "
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="
        rounded-card border border-primary-border
        bg-surface px-5 py-15 text-center
      "
    >
      <div
        aria-hidden="true"
        className="mb-3 text-5xl"
      >
        🔍
      </div>

      <h3 className="text-subsection-heading text-text-primary">
        Nema rezultata
      </h3>

      <p className="mt-1 text-body-sm text-text-muted">
        Pokušajte s drugačijim filterima
      </p>
    </div>
  );
}
