import type {
  OwnerFacilityData,
  Sport,
} from "../../hooks/useProfileOwnerFacilities";

interface OwnerFacilityModalProps {
  isOpen: boolean;
  mode: "dodaj" | "uredi";
  data: OwnerFacilityData;
  sports: Sport[];
  neighborhoods: string[];
  selectedSports: number[];
  saving: boolean;
  message: string;
  onChange: (data: OwnerFacilityData) => void;
  onSportToggle: (id: number) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function OwnerFacilityModal({
  isOpen,
  mode,
  data,
  sports,
  neighborhoods,
  selectedSports,
  saving,
  message,
  onChange,
  onSportToggle,
  onClose,
  onSave,
}: OwnerFacilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-facility-title"
        className="sport-modal max-h-[90vh] w-full max-w-[480px] overflow-y-auto p-5 sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id="owner-facility-title"
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
          <div>
            <label htmlFor="facility-name" className="sport-label mb-1.5">
              Naziv <span className="text-danger">*</span>
            </label>

            <input
              id="facility-name"
              type="text"
              value={data.naziv}
              onChange={(event) =>
                onChange({ ...data, naziv: event.target.value })
              }
              className="sport-input"
              required
            />
          </div>

          <div>
            <label htmlFor="facility-address" className="sport-label mb-1.5">
              Adresa <span className="text-danger">*</span>
            </label>

            <input
              id="facility-address"
              type="text"
              value={data.adresa}
              onChange={(event) =>
                onChange({ ...data, adresa: event.target.value })
              }
              className="sport-input"
              required
            />
          </div>

          <div>
            <label
              htmlFor="facility-neighborhood"
              className="sport-label mb-1.5"
            >
              Kvart <span className="text-danger">*</span>
            </label>

            <select
              id="facility-neighborhood"
              value={data.kvart}
              onChange={(event) =>
                onChange({ ...data, kvart: event.target.value })
              }
              className="sport-input"
              required
            >
              <option value="">— odaberi kvart —</option>

              {data.kvart && !neighborhoods.includes(data.kvart) && (
                <option value={data.kvart}>{data.kvart}</option>
              )}

              {neighborhoods.map((kvart) => (
                <option key={kvart} value={kvart}>
                  {kvart}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="facility-capacity" className="sport-label mb-1.5">
              Kapacitet
            </label>

            <input
              id="facility-capacity"
              type="number"
              min="0"
              value={data.kapacitet}
              onChange={(event) =>
                onChange({ ...data, kapacitet: event.target.value })
              }
              className="sport-input"
            />
          </div>

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

          <div>
            <label
              htmlFor="facility-description"
              className="sport-label mb-1.5"
            >
              Opis
            </label>

            <textarea
              id="facility-description"
              value={data.opis}
              onChange={(event) =>
                onChange({ ...data, opis: event.target.value })
              }
              rows={3}
              className="sport-input resize-y"
            />
          </div>

          <div>
            <label htmlFor="facility-image" className="sport-label mb-1.5">
              URL slike
            </label>

            <input
              id="facility-image"
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
                className="mt-2 h-[140px] w-full rounded-control border border-border-default object-cover"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            )}
          </div>

          {message && (
            <p
              role="alert"
              className="rounded-control bg-danger-soft p-3 text-body-sm font-semibold text-danger"
            >
              {message}
            </p>
          )}

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
