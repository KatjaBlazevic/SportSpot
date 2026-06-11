import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ocjena: number, komentar: string) => void;
  objektNaziv: string;
}

export default function NovaRecenzijaObrazac({
  isOpen,
  onClose,
  onSubmit,
  objektNaziv,
}: Props) {
  const [ocjena, setOcjena] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-blue-50 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Vaš dojam
          </h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Objekt: <span className="text-blue-600">{objektNaziv}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* INTERAKTIVNE ZVJEZDICE */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Ocjena
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-4xl transition-all duration-200 transform hover:scale-125 active:scale-90 ${
                    star <= (hover || ocjena)
                      ? "text-amber-400"
                      : "text-slate-200"
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
              Komentar
            </label>
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none text-slate-700 font-medium placeholder:text-slate-300"
              placeholder="Napišite nešto o terenu, dvorani, osoblju..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all"
            >
              Odustani
            </button>
            <button
              onClick={() => onSubmit(ocjena, komentar)}
              disabled={ocjena === 0}
              className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20"
            >
              Objavi recenziju
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
