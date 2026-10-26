import type { AdminUser } from "../../hooks/useProfileAdminUsers";

import type { ProfileRole } from "./profileConfig";

interface ProfileAdminUsersProps {
  korisnici: AdminUser[];
  trenutniKorisnikId: number;
  ucitavanje: boolean;
  greska: string | null;
  akcijaId: number | null;
  onAdd: () => void;
  onRoleChange: (id: number, uloga: ProfileRole) => void;
  onDelete: (id: number) => void;
}

const uloge: ProfileRole[] = ["User", "Vlasnik", "Admin"];

export default function ProfileAdminUsers({
  korisnici,
  trenutniKorisnikId,
  ucitavanje,
  greska,
  akcijaId,
  onAdd,
  onRoleChange,
  onDelete,
}: ProfileAdminUsersProps) {
  return (
    <section className="sport-card p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-card-heading text-text-primary">
          Korisnici ({korisnici.length})
        </h2>

        <button
          type="button"
          onClick={onAdd}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          + Dodaj korisnika
        </button>
      </div>

      {greska && (
        <p
          role="alert"
          className="mb-4 rounded-control bg-danger-soft p-3 text-body-sm text-danger"
        >
          {greska}
        </p>
      )}

      {ucitavanje ? (
        <p className="p-10 text-center text-text-secondary">
          Učitavam korisnike...
        </p>
      ) : korisnici.length === 0 ? (
        <div className="p-10 text-center text-text-muted">
          <div className="mb-3 text-4xl">👥</div>
          <p>Nema korisnika za prikaz.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-body-sm">
            <thead>
              <tr className="bg-surface-soft">
                {[
                  "ID",
                  "Ime i prezime",
                  "E-mail",
                  "Mobitel",
                  "Uloga",
                  "Akcije",
                ].map((naslov) => (
                  <th
                    key={naslov}
                    scope="col"
                    className="border-b border-border-default px-4 py-3 font-semibold text-text-secondary"
                  >
                    {naslov}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {korisnici.map((korisnik) => {
                const isCurrentUser = korisnik.id === trenutniKorisnikId;

                const isProcessing = akcijaId === korisnik.id;

                return (
                  <tr
                    key={korisnik.id}
                    className="border-b border-border-default last:border-b-0"
                  >
                    <td className="px-4 py-3 text-text-muted">{korisnik.id}</td>

                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {korisnik.ime} {korisnik.prezime}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-text-muted">
                          (Vi)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {korisnik.email}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {korisnik.brojMobitela || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        aria-label={`Uloga korisnika ${korisnik.ime} ${korisnik.prezime}`}
                        value={korisnik.uloga}
                        disabled={isProcessing || isCurrentUser}
                        onChange={(event) =>
                          onRoleChange(
                            korisnik.id,
                            event.target.value as ProfileRole,
                          )
                        }
                        className="cursor-pointer rounded-control border border-border-default bg-surface px-3 py-2 text-body-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uloge.map((uloga) => (
                          <option key={uloga} value={uloga}>
                            {uloga}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      {!isCurrentUser && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onDelete(korisnik.id)}
                          className="btn-danger px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "Obrađujem..." : "Obriši"}
                        </button>
                      )}
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
