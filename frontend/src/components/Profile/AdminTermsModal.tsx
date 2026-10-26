import type {
  AdminTermin,
  AdminTerminFormData,
} from "../../hooks/useProfileAdminTerms";

interface AdminTermsModalProps {
  isOpen: boolean;
  facilityName: string;
  terms: AdminTermin[];
  loading: boolean;
  error: string | null;
  message: string;
  showForm: boolean;
  editTerm: AdminTermin | null;
  data: AdminTerminFormData;
  saving: boolean;
  deletingId: number | null;
  onChange: (data: AdminTerminFormData) => void;
  onAdd: () => void;
  onEdit: (termin: AdminTermin) => void;
  onDelete: (id: number) => void;
  onSave: () => void;
  onCancelForm: () => void;
  onClose: () => void;
}

export default function AdminTermsModal({
  isOpen,
  facilityName,
  terms,
  loading,
  error,
  message,
  showForm,
  editTerm,
  data,
  saving,
  deletingId,
  onChange,
  onAdd,
  onEdit,
  onDelete,
  onSave,
  onCancelForm,
  onClose,
}: AdminTermsModalProps) {
  if (!isOpen) return null;

  const busy = saving || deletingId !== null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-terms-title"
        className="sport-modal max-h-[90vh] w-full max-w-[650px] overflow-y-auto p-5 sm:p-7"
      >
        {/* Zaglavlje */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="admin-terms-title"
              className="text-section-heading text-text-primary"
            >
              Termini — {facilityName}
            </h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Upravljanje terminima sportskog objekta
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Zatvori termine"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-text-secondary hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Dodavanje termina */}
        {!showForm && (
          <button
            type="button"
            onClick={onAdd}
            disabled={busy}
            className="btn-primary mb-5 px-4 py-2.5 text-body-sm"
          >
            + Dodaj termin
          </button>
        )}

        {/* Obrazac */}
        {showForm && (
          <form
            className="mb-5 flex flex-col gap-4 rounded-card border border-border-default bg-surface-soft p-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <h3 className="text-subsection-heading text-text-primary">
              {editTerm ? "Uredi termin" : "Novi termin"}
            </h3>

            {!editTerm && (
              <div>
                <label htmlFor="admin-term-date" className="sport-label mb-1.5">
                  Datum <span className="text-danger">*</span>
                </label>

                <input
                  id="admin-term-date"
                  type="date"
                  value={data.datum}
                  onChange={(event) =>
                    onChange({
                      ...data,
                      datum: event.target.value,
                    })
                  }
                  className="sport-input"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="admin-term-start"
                  className="sport-label mb-1.5"
                >
                  Početak <span className="text-danger">*</span>
                </label>

                <input
                  id="admin-term-start"
                  type="time"
                  value={data.vrijemePocetka}
                  onChange={(event) =>
                    onChange({
                      ...data,
                      vrijemePocetka: event.target.value,
                    })
                  }
                  className="sport-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="admin-term-end" className="sport-label mb-1.5">
                  Kraj <span className="text-danger">*</span>
                </label>

                <input
                  id="admin-term-end"
                  type="time"
                  value={data.vrijemeKraja}
                  onChange={(event) =>
                    onChange({
                      ...data,
                      vrijemeKraja: event.target.value,
                    })
                  }
                  className="sport-input"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-term-price" className="sport-label mb-1.5">
                Cijena (€) <span className="text-danger">*</span>
              </label>

              <input
                id="admin-term-price"
                type="number"
                min="0"
                step="0.01"
                value={data.cijena}
                onChange={(event) =>
                  onChange({
                    ...data,
                    cijena: event.target.value,
                  })
                }
                className="sport-input"
                required
              />
            </div>

            {/* Ponavljanje je dostupno samo kod dodavanja */}
            {!editTerm && (
              <div className="border-t border-border-default pt-4">
                <label className="flex cursor-pointer items-center gap-2 text-body-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={data.ponavljaj}
                    onChange={(event) =>
                      onChange({
                        ...data,
                        ponavljaj: event.target.checked,
                        ponavljajDo: event.target.checked
                          ? data.ponavljajDo
                          : "",
                      })
                    }
                    className="size-4 accent-primary"
                  />
                  Ponavljaj termin tjedno
                </label>

                {data.ponavljaj && (
                  <div className="mt-3">
                    <label
                      htmlFor="admin-term-repeat-until"
                      className="sport-label mb-1.5"
                    >
                      Ponavljaj do
                    </label>

                    <input
                      id="admin-term-repeat-until"
                      type="date"
                      min={data.datum || undefined}
                      value={data.ponavljajDo}
                      onChange={(event) =>
                        onChange({
                          ...data,
                          ponavljajDo: event.target.value,
                        })
                      }
                      className="sport-input"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {message && (
              <p
                role="alert"
                className="rounded-control bg-danger-soft p-3 text-body-sm text-danger"
              >
                {message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCancelForm}
                disabled={saving}
                className="btn-secondary flex-1 px-4 py-2.5"
              >
                Odustani
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 px-4 py-2.5"
              >
                {saving ? "Spremam..." : "Spremi"}
              </button>
            </div>
          </form>
        )}

        {/* Greška dohvaćanja ili brisanja */}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-control bg-danger-soft p-3 text-body-sm text-danger"
          >
            {error}
          </p>
        )}

        {/* Popis termina */}
        <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-text-secondary">
              Učitavam termine...
            </p>
          ) : terms.length === 0 ? (
            <p className="py-8 text-center text-text-muted">
              Nema termina za prikaz.
            </p>
          ) : (
            terms.map((termin) => (
              <article
                key={termin.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-default bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-text-primary">
                    {new Date(termin.datum).toLocaleDateString("hr-HR")}
                    {" · "}
                    {termin.vrijemePocetka}–{termin.vrijemeKraja}
                  </p>

                  <p className="mt-1 text-body-sm text-text-secondary">
                    {termin.cijena} €{" · "}
                    <span
                      className={
                        termin.status === "Slobodan"
                          ? "font-semibold text-success"
                          : "font-semibold text-danger"
                      }
                    >
                      {termin.status}
                    </span>
                    {termin.korisnik ? ` · ${termin.korisnik}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(termin)}
                    disabled={busy}
                    className="btn-secondary px-3 py-2 text-body-sm"
                  >
                    Uredi
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(termin.id)}
                    disabled={busy}
                    className="btn-danger px-3 py-2 text-body-sm"
                  >
                    {deletingId === termin.id ? "Brišem..." : "Obriši"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-border-default pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-secondary w-full px-4 py-2.5"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
