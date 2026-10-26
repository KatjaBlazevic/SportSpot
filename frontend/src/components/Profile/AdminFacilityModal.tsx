import type {
  AdminFacilityFormData,
  AdminFacilityOwner,
  AdminFacilityClub,
  AdminFacilitySport,
} from "../../hooks/useProfileAdminFacilities";

interface AdminFacilityModalProps {
  isOpen: boolean;
  mode: "dodaj" | "uredi";

  data: AdminFacilityFormData;
  owners: AdminFacilityOwner[];
  clubs: AdminFacilityClub[];
  sports: AdminFacilitySport[];
  neighborhoods: string[];

  selectedSports: number[];
  isNewNeighborhood: boolean;

  saving: boolean;
  message: string;

  onChange: (data: AdminFacilityFormData) => void;
  onSportToggle: (id: number) => void;
  onNeighborhoodToggle: () => void;
  onClose: () => void;
  onSave: () => void;
}

export default function AdminFacilityModal({
  isOpen,
  mode,
  data,
  owners,
  clubs,
  sports,
  neighborhoods,
  selectedSports,
  isNewNeighborhood,
  saving,
  message,
  onChange,
  onSportToggle,
  onNeighborhoodToggle,
  onClose,
  onSave,
}: AdminFacilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-facility-modal-title"
        className="sport-modal max-h-[90vh] w-full max-w-[520px] overflow-y-auto p-5 sm:p-8"
      >
        {/* Zaglavlje */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="admin-facility-modal-title"
            className="text-section-heading text-text-primary"
          >
            {mode === "dodaj" ? "Dodaj objekt" : "Uredi objekt"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Zatvori obrazac objekta"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-text-secondary hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
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
          {/* Naziv */}
          <div>
            <label htmlFor="admin-facility-name" className="sport-label mb-1.5">
              Naziv <span className="text-danger">*</span>
            </label>

            <input
              id="admin-facility-name"
              type="text"
              className="sport-input"
              value={data.naziv}
              onChange={(event) =>
                onChange({ ...data, naziv: event.target.value })
              }
              required
            />
          </div>

          {/* Adresa */}
          <div>
            <label
              htmlFor="admin-facility-address"
              className="sport-label mb-1.5"
            >
              Adresa <span className="text-danger">*</span>
            </label>

            <input
              id="admin-facility-address"
              type="text"
              className="sport-input"
              value={data.adresa}
              onChange={(event) =>
                onChange({ ...data, adresa: event.target.value })
              }
              required
            />
          </div>

          {/* Kvart */}
          <div>
            <label
              htmlFor="admin-facility-neighborhood"
              className="sport-label mb-1.5"
            >
              Kvart <span className="text-danger">*</span>
            </label>

            <div className="flex items-center gap-2">
              {isNewNeighborhood ? (
                <input
                  id="admin-facility-neighborhood"
                  type="text"
                  value={data.kvart}
                  onChange={(event) =>
                    onChange({ ...data, kvart: event.target.value })
                  }
                  placeholder="Naziv novog kvarta"
                  className="sport-input min-w-0 flex-1"
                  required
                />
              ) : (
                <select
                  id="admin-facility-neighborhood"
                  value={data.kvart}
                  onChange={(event) =>
                    onChange({ ...data, kvart: event.target.value })
                  }
                  className="sport-input min-w-0 flex-1"
                  required
                >
                  <option value="">— odaberi kvart —</option>

                  {neighborhoods.map((kvart) => (
                    <option key={kvart} value={kvart}>
                      {kvart}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={onNeighborhoodToggle}
                className="btn-secondary shrink-0 px-3 py-2.5 text-body-sm"
              >
                {isNewNeighborhood ? "↩ Odaberi" : "+ Novi"}
              </button>
            </div>
          </div>

          {/* Kapacitet */}
          <div>
            <label
              htmlFor="admin-facility-capacity"
              className="sport-label mb-1.5"
            >
              Kapacitet
            </label>

            <input
              id="admin-facility-capacity"
              type="number"
              min="0"
              className="sport-input"
              value={data.kapacitet}
              onChange={(event) =>
                onChange({ ...data, kapacitet: event.target.value })
              }
            />
          </div>

          {/* Vlasnik */}
          <div>
            <label
              htmlFor="admin-facility-owner"
              className="sport-label mb-1.5"
            >
              Vlasnik
            </label>

            <select
              id="admin-facility-owner"
              className="sport-input"
              value={data.vlasnikId}
              onChange={(event) =>
                onChange({ ...data, vlasnikId: event.target.value })
              }
            >
              <option value="">— bez vlasnika —</option>

              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.ime} {owner.prezime} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          {/* Klub */}
          <div>
            <label htmlFor="admin-facility-club" className="sport-label mb-1.5">
              Klub
            </label>

            <select
              id="admin-facility-club"
              className="sport-input"
              value={data.idKluba}
              onChange={(event) =>
                onChange({ ...data, idKluba: event.target.value })
              }
            >
              <option value="">— bez kluba —</option>

              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.naziv}
                </option>
              ))}
            </select>
          </div>

          {/* Sportovi */}
          <fieldset>
            <legend className="sport-label mb-2">Sportovi</legend>

            <div className="grid max-h-[150px] grid-cols-1 gap-2 overflow-y-auto rounded-control border border-border-default p-3 sm:grid-cols-2">
              {sports.length === 0 ? (
                <p className="col-span-full text-body-sm text-text-muted">
                  Nema dostupnih sportova.
                </p>
              ) : (
                sports.map((sport) => (
                  <label
                    key={sport.ID_sporta}
                    className="flex cursor-pointer items-center gap-2 text-body-sm text-text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport.ID_sporta)}
                      onChange={() => onSportToggle(sport.ID_sporta)}
                      className="size-4 accent-primary"
                    />

                    {sport.Naziv_sporta}
                  </label>
                ))
              )}
            </div>
          </fieldset>

          {/* Opis */}
          <div>
            <label
              htmlFor="admin-facility-description"
              className="sport-label mb-1.5"
            >
              Opis
            </label>

            <textarea
              id="admin-facility-description"
              rows={3}
              value={data.opis}
              onChange={(event) =>
                onChange({ ...data, opis: event.target.value })
              }
              className="sport-input resize-y"
            />
          </div>

          {/* URL slike */}
          <div>
            <label
              htmlFor="admin-facility-image"
              className="sport-label mb-1.5"
            >
              URL slike
            </label>

            <input
              id="admin-facility-image"
              type="url"
              placeholder="https://..."
              value={data.slikaUrl}
              onChange={(event) =>
                onChange({ ...data, slikaUrl: event.target.value })
              }
              className="sport-input"
            />

            {data.slikaUrl && (
              <img
                key={data.slikaUrl}
                src={data.slikaUrl}
                alt="Pregled slike sportskog objekta"
                className="mt-2 h-[120px] w-full rounded-control border border-border-default object-cover"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            )}
          </div>

          {/* Greška */}
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
              {saving ? "Spremam..." : "Spremi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
