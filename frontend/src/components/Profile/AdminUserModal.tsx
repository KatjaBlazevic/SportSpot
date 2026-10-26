import type { NewAdminUser } from "../../hooks/useProfileAdminUsers";

import type { ProfileRole } from "./profileConfig";

interface AdminUserModalProps {
  isOpen: boolean;
  data: NewAdminUser;
  saving: boolean;
  message: string;
  onChange: (data: NewAdminUser) => void;
  onClose: () => void;
  onSave: () => void;
}

const uloge: { value: ProfileRole; label: string }[] = [
  { value: "User", label: "Korisnik" },
  { value: "Vlasnik", label: "Vlasnik" },
  { value: "Admin", label: "Administrator" },
];

export default function AdminUserModal({
  isOpen,
  data,
  saving,
  message,
  onChange,
  onClose,
  onSave,
}: AdminUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-modal-title"
        className="sport-modal max-h-[90vh] w-full max-w-[480px] overflow-y-auto p-5 sm:p-8"
      >
        {/* Zaglavlje */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="admin-user-modal-title"
            className="text-section-heading text-text-primary"
          >
            Dodaj korisnika
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Zatvori obrazac"
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
          <div>
            <label htmlFor="admin-user-ime" className="sport-label mb-1.5">
              Ime <span className="text-danger">*</span>
            </label>

            <input
              id="admin-user-ime"
              type="text"
              value={data.ime}
              onChange={(event) =>
                onChange({ ...data, ime: event.target.value })
              }
              className="sport-input"
              autoComplete="given-name"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-user-prezime" className="sport-label mb-1.5">
              Prezime <span className="text-danger">*</span>
            </label>

            <input
              id="admin-user-prezime"
              type="text"
              value={data.prezime}
              onChange={(event) =>
                onChange({ ...data, prezime: event.target.value })
              }
              className="sport-input"
              autoComplete="family-name"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-user-email" className="sport-label mb-1.5">
              E-mail <span className="text-danger">*</span>
            </label>

            <input
              id="admin-user-email"
              type="email"
              value={data.email}
              onChange={(event) =>
                onChange({ ...data, email: event.target.value })
              }
              className="sport-input"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-user-password" className="sport-label mb-1.5">
              Lozinka <span className="text-danger">*</span>
            </label>

            <input
              id="admin-user-password"
              type="password"
              value={data.lozinka}
              onChange={(event) =>
                onChange({ ...data, lozinka: event.target.value })
              }
              className="sport-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-user-phone" className="sport-label mb-1.5">
              Broj mobitela
              <span className="ml-1 font-normal text-text-muted">
                (nije obavezno)
              </span>
            </label>

            <input
              id="admin-user-phone"
              type="tel"
              value={data.brojMobitela}
              onChange={(event) =>
                onChange({
                  ...data,
                  brojMobitela: event.target.value,
                })
              }
              className="sport-input"
              autoComplete="tel"
              placeholder="+385 91 234 5678"
            />
          </div>

          <div>
            <label htmlFor="admin-user-role" className="sport-label mb-1.5">
              Uloga <span className="text-danger">*</span>
            </label>

            <select
              id="admin-user-role"
              value={data.uloga}
              onChange={(event) =>
                onChange({
                  ...data,
                  uloga: event.target.value as ProfileRole,
                })
              }
              className="sport-input"
              required
            >
              {uloge.map((uloga) => (
                <option key={uloga.value} value={uloga.value}>
                  {uloga.label}
                </option>
              ))}
            </select>
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
              {saving ? "Spremam..." : "Dodaj korisnika"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
