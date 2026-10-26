import { useState } from "react";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ocjena: number, komentar: string) => void;
  objektNaziv: string;
}

export default function ReviewForm({
  isOpen,
  onClose,
  onSubmit,
  objektNaziv,
}: ReviewFormProps) {
  const [ocjena, setOcjena] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-text-primary/60 p-4 backdrop-blur-md">
      <div className="sport-modal w-full max-w-md border border-primary-soft p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h3 className="text-section-heading text-text-primary tracking-tight">
            Vaš dojam
          </h3>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Objekt: <span className="text-primary">{objektNaziv}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* INTERAKTIVNE ZVJEZDICE */}
          <div className="flex flex-col items-center gap-2">
            <label className="sport-label text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              Ocjena
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-4xl transition-all duration-200 transform hover:scale-125 active:scale-90 ${
                    star <= (hover || ocjena)
                      ? "text-chart-amber"
                      : "text-border-default"
                  }`}
                  onClick={() => setOcjena(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="sport-label mb-2 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              Komentar
            </label>
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              className="sport-input h-32 resize-none rounded-2xl p-4 font-medium placeholder:text-text-muted"
              placeholder="Napišite nešto o terenu, dvorani, osoblju..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1 rounded-2xl px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
            >
              Odustani
            </button>
            <button
              onClick={() => onSubmit(ocjena, komentar)}
              disabled={ocjena === 0}
              className="btn-primary flex-1 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-sport-primary disabled:shadow-none"
            >
              Objavi recenziju
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
