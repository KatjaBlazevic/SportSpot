import type { AdminClubFormData } from "../../hooks/useProfileAdminClubs";

interface AdminClubModalProps {
  isOpen: boolean;
  mode: "dodaj" | "uredi";
  data: AdminClubFormData;
  saving: boolean;
  message: string;
  onChange: (data: AdminClubFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminClubModal({
  isOpen,
  mode,
  data,
  saving,
  message,
  onChange,
  onClose,
  onSave,
}: AdminClubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-club-modal-title"
        className="sport-modal max-h-[90vh] w-full max-w-[480px] overflow-y-auto p-5 sm:p-8"
      >
        {/* Zaglavlje */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="admin-club-modal-title"
            className="text-section-heading text-text-primary"
          >
            {mode === "dodaj" ? "Dodaj klub" : "Uredi klub"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Zatvori obrazac kluba"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-text-secondary transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Obrazac */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {/* Naziv kluba */}
          <div>
            <label htmlFor="admin-club-name" className="sport-label mb-1.5">
              Naziv kluba <span className="text-danger">*</span>
            </label>

            <input
              id="admin-club-name"
              type="text"
              value={data.naziv}
              onChange={(event) =>
                onChange({
                  ...data,
                  naziv: event.target.value,
                })
              }
              className="sport-input"
              required
            />
          </div>

          {/* OIB */}
          <div>
            <label htmlFor="admin-club-oib" className="sport-label mb-1.5">
              OIB <span className="text-danger">*</span>
            </label>

            <input
              id="admin-club-oib"
              type="text"
              inputMode="numeric"
              maxLength={11}
              pattern="[0-9]{11}"
              title="OIB mora sadržavati točno 11 znamenki."
              value={data.oib}
              onChange={(event) =>
                onChange({
                  ...data,
                  oib: event.target.value.replace(/\D/g, ""),
                })
              }
              className="sport-input"
              placeholder="Unesite 11 znamenki"
              required
            />

            <p className="mt-1 text-helper text-text-muted">
              OIB mora sadržavati točno 11 znamenki.
            </p>
          </div>

          {/* Kontakt */}
          <div>
            <label htmlFor="admin-club-contact" className="sport-label mb-1.5">
              Kontakt telefon
              <span className="ml-1 font-normal text-text-muted">
                (nije obavezno)
              </span>
            </label>

            <input
              id="admin-club-contact"
              type="tel"
              value={data.kontakt}
              onChange={(event) =>
                onChange({
                  ...data,
                  kontakt: event.target.value,
                })
              }
              className="sport-input"
              placeholder="+385 91 234 5678"
            />
          </div>

          {/* Poruka o grešci */}
          {message && (
            <p
              role="alert"
              className="rounded-control bg-danger-soft p-3 text-body-sm font-semibold text-danger"
            >
              {message}
            </p>
          )}

          {/* Akcije */}
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary flex-1 px-4 py-3"
            >
              Odustani
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 px-4 py-3"
            >
              {saving
                ? "Spremam..."
                : mode === "dodaj"
                  ? "Dodaj klub"
                  : "Spremi promjene"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
