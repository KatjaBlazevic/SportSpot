type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const baseButtonClass = `
    flex size-9 items-center justify-center
    rounded-full border font-bold
    transition-colors cursor-pointer
    disabled:cursor-default
    disabled:text-text-muted
  `;

  const navigationButtonClass = `
    ${baseButtonClass}
    border-border-default bg-surface
    text-base text-text-primary
    hover:enabled:bg-surface-soft
  `;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TODO: Ako broj stranica znatno naraste, prikazivati
  // ograničen broj stranica s trotočkom umjesto svih gumba.

  return (
    <nav
      aria-label="Navigacija po stranicama rezultata"
      className="mt-2 flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        aria-label="Prethodna stranica"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navigationButtonClass}
      >
        <span aria-hidden="true">‹</span>
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => {
          const isActive = currentPage === page;

          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              aria-label={`Stranica ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={`
              ${baseButtonClass}
              text-body-sm
              ${
                isActive
                  ? "border-primary bg-primary text-text-inverse"
                  : "border-border-default bg-surface text-text-primary hover:bg-surface-soft"
              }
            `}
            >
              {page}
            </button>
          );
        },
      )}

      <button
        type="button"
        aria-label="Sljedeća stranica"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navigationButtonClass}
      >
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
