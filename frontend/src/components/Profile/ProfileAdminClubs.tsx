import type { AdminClub } from "../../hooks/useProfileAdminClubs";

interface ProfileAdminClubsProps {
  klubovi: AdminClub[];
  ucitavanje: boolean;
  greska: string | null;
  brisanjeId: number | null;
  onAdd: () => void;
  onEdit: (klub: AdminClub) => void;
  onDelete: (id: number) => void;
}

export default function ProfileAdminClubs({
  klubovi,
  ucitavanje,
  greska,
  brisanjeId,
  onAdd,
  onEdit,
  onDelete,
}: ProfileAdminClubsProps) {
  return (
    <section className="sport-card p-5 sm:p-7">
      {/* Zaglavlje */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-card-heading text-text-primary">
          Klubovi ({klubovi.length})
        </h2>

        <button
          type="button"
          onClick={onAdd}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          + Dodaj klub
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

      {/* Prikaz klubova */}
      {ucitavanje ? (
        <p className="p-10 text-center text-text-secondary">
          Učitavam klubove...
        </p>
      ) : klubovi.length === 0 ? (
        <div className="p-10 text-center text-text-muted">
          <div className="mb-3 text-5xl">⚽</div>
          <p>Nema klubova za prikaz.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-body-sm">
            <thead>
              <tr className="bg-surface-soft">
                {["Naziv", "OIB", "Kontakt", "Objekti", "Akcije"].map(
                  (naslov) => (
                    <th
                      key={naslov}
                      scope="col"
                      className="border-b border-border-default px-4 py-3 font-semibold text-text-secondary"
                    >
                      {naslov}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {klubovi.map((klub) => {
                const isDeleting = brisanjeId === klub.id;

                return (
                  <tr
                    key={klub.id}
                    className="border-b border-border-default last:border-b-0"
                  >
                    {/* Naziv */}
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {klub.naziv}
                    </td>

                    {/* OIB */}
                    <td className="px-4 py-3 font-mono text-text-secondary">
                      {klub.oib}
                    </td>

                    {/* Kontakt */}
                    <td className="px-4 py-3 text-text-secondary">
                      {klub.kontakt || "—"}
                    </td>

                    {/* Povezani sportski objekti */}
                    <td className="px-4 py-3 text-text-secondary">
                      {klub.objektiNazivi.length > 0 ? (
                        <ul className="flex flex-col gap-1">
                          {klub.objektiNazivi.map((naziv, index) => (
                            <li
                              key={`${klub.id}-${index}`}
                              className="text-[13px]"
                            >
                              • {naziv}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Akcije */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(klub)}
                          disabled={isDeleting}
                          className="btn-secondary px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Uredi
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(klub.id)}
                          disabled={isDeleting}
                          className="btn-danger px-3 py-2 text-body-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Brišem..." : "Obriši"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
