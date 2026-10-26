import { useState } from "react";
import type { NewSlotsData } from "../../hooks/useFacilityActions";

interface NewSlotsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSlotsData) => void;
  objektNaziv: string;
}

// TODO: Implementirati napredno kreiranje i ponavljanje termina.
// - Omogućiti odabir dana u tjednu kojima objekt radi (npr. ponedjeljak–petak).
// - Omogućiti isključivanje pojedinih dana iz tjednog ponavljanja (npr. vikenda).
// - Omogućiti unos početka i kraja radnog vremena (npr. 08:00–20:00).
// - Automatski generirati termine unutar zadanog radnog vremena.
// - Omogućiti odabir trajanja termina (npr. 30, 60, 90 ili 120 minuta).
// - Omogućiti definiranje pauza i nedostupnih sati (npr. 12:00–14:00).
// - Podržati različito radno vrijeme za pojedine dane u tjednu.
// - Omogućiti izuzimanje određenih datuma (praznici, neradni dani i sl.).
// - Prikazati pregled svih generiranih termina prije spremanja.
// - Omogućiti ručno uklanjanje ili izmjenu pojedinih generiranih termina.
// - Prilagoditi backend logiku za generiranje termina prema zadanim pravilima.

export default function NewSlotsForm({
  isOpen,
  onClose,
  onSubmit,
  objektNaziv,
}: NewSlotsFormProps) {
  const [formData, setFormData] = useState({
    datumPocetka: "",
    vrijemePocetka: "",
    vrijemeKraja: "",
    cijena: "",
    recurring: false,
    ponavljajDo: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (
      !formData.datumPocetka ||
      !formData.vrijemePocetka ||
      !formData.vrijemeKraja ||
      !formData.cijena
    ) {
      alert("Popuni sva polja prije objave!");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary/60 p-4 backdrop-blur-md">
      <div className="sport-modal w-full max-w-md border border-primary-soft p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h3 className="text-section-heading text-text-primary tracking-tight uppercase">
            Novi Termini
          </h3>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Upravljanje objektom:{" "}
            <span className="font-bold text-primary">{objektNaziv}</span>
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="sport-label mb-2 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              Datum termina
            </label>
            <input
              type="date"
              value={formData.datumPocetka}
              onChange={(e) =>
                setFormData({ ...formData, datumPocetka: e.target.value })
              }
              className="sport-input rounded-2xl p-4 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sport-label mb-2 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                Početak
              </label>
              <input
                type="time"
                value={formData.vrijemePocetka}
                onChange={(e) =>
                  setFormData({ ...formData, vrijemePocetka: e.target.value })
                }
                className="sport-input rounded-2xl p-4 font-bold"
              />
            </div>
            <div>
              <label className="sport-label mb-2 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                Kraj
              </label>
              <input
                type="time"
                value={formData.vrijemeKraja}
                onChange={(e) =>
                  setFormData({ ...formData, vrijemeKraja: e.target.value })
                }
                className="sport-input rounded-2xl p-4 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="sport-label mb-2 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              Cijena (€)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.cijena}
              onChange={(e) =>
                setFormData({ ...formData, cijena: e.target.value })
              }
              className="sport-input rounded-2xl p-4 font-bold"
            />
          </div>

          {/* RECURRING LOGIKA */}
          <div
            className={`rounded-panel border-2 p-5 transition-all ${
              formData.recurring
                ? "border-primary bg-primary-soft"
                : "border-border-light bg-surface-soft"
            }`}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) =>
                  setFormData({ ...formData, recurring: e.target.checked })
                }
                className="size-5 rounded-lg accent-primary"
              />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                Ponavljaj tjedno
              </span>
            </label>

            {formData.recurring && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                <label className="sport-label mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Ponavljaj do datuma
                </label>
                <input
                  type="date"
                  value={formData.ponavljajDo}
                  onChange={(e) =>
                    setFormData({ ...formData, ponavljajDo: e.target.value })
                  }
                  className="sport-input rounded-xl bg-surface p-3 font-bold"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1 rounded-2xl px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
            >
              Odustani
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex-1 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-sport-primary"
            >
              Dodaj Termine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
