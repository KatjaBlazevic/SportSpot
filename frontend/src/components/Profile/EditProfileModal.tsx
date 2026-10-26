export interface ProfileEditData {
  ime: string;
  prezime: string;
  email: string;
  brojMobitela: string;
  novaLozinka: string;
  potvrdaLozinke: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  data: ProfileEditData;
  spremanje: boolean;
  poruka: string;
  onChange: (data: ProfileEditData) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileModal({
  isOpen,
  data,
  spremanje,
  poruka,
  onChange,
  onClose,
  onSave,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="sport-modal max-h-[90vh] w-full max-w-[480px] overflow-y-auto p-5 sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="edit-profile-title"
            className="text-section-heading text-text-primary"
          >
            Uredi profil
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori uređivanje profila"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-text-secondary hover:bg-surface-soft"
          >
            ✕
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {(
            [
              { key: "ime", label: "Ime", type: "text" },
              { key: "prezime", label: "Prezime", type: "text" },
              { key: "email", label: "E-mail", type: "email" },
            ] as const
          ).map((field) => (
            <div key={field.key}>
              <label
                htmlFor={`profile-${field.key}`}
                className="sport-label mb-1.5"
              >
                {field.label}
              </label>

              <input
                id={`profile-${field.key}`}
                type={field.type}
                value={data[field.key]}
                onChange={(event) =>
                  onChange({
                    ...data,
                    [field.key]: event.target.value,
                  })
                }
                className="sport-input"
                required
              />
            </div>
          ))}

          <div>
            <label htmlFor="profile-mobitel" className="sport-label mb-1.5">
              Broj mobitela
              <span className="ml-1 font-normal text-text-muted">
                (nije obavezno)
              </span>
            </label>

            <input
              id="profile-mobitel"
              type="tel"
              value={data.brojMobitela}
              onChange={(event) =>
                onChange({
                  ...data,
                  brojMobitela: event.target.value,
                })
              }
              placeholder="+385 91 234 5678"
              className="sport-input"
            />
          </div>

          <div className="mt-2 space-y-3 border-t border-border-default pt-4">
            <div>
              <label
                htmlFor="profile-nova-lozinka"
                className="sport-label mb-1.5"
              >
                Nova lozinka
                <span className="ml-1 font-normal text-text-muted">
                  (ostavi prazno ako ne mijenjaš)
                </span>
              </label>

              <input
                id="profile-nova-lozinka"
                type="password"
                autoComplete="new-password"
                value={data.novaLozinka}
                onChange={(event) =>
                  onChange({
                    ...data,
                    novaLozinka: event.target.value,
                  })
                }
                className="sport-input"
              />
            </div>

            <div>
              <label
                htmlFor="profile-potvrda-lozinke"
                className="sport-label mb-1.5"
              >
                Potvrdi lozinku
              </label>

              <input
                id="profile-potvrda-lozinke"
                type="password"
                autoComplete="new-password"
                value={data.potvrdaLozinke}
                onChange={(event) =>
                  onChange({
                    ...data,
                    potvrdaLozinke: event.target.value,
                  })
                }
                className="sport-input"
              />
            </div>
          </div>

          {poruka && (
            <div
              role="alert"
              className="rounded-control bg-danger-soft p-3 text-body-sm font-semibold text-danger"
            >
              {poruka}
            </div>
          )}

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 px-4 py-3"
            >
              Odustani
            </button>

            <button
              type="submit"
              disabled={spremanje}
              className="btn-primary flex-1 px-4 py-3"
            >
              {spremanje ? "Spremam..." : "Spremi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
