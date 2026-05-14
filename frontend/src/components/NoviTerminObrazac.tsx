import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  objektNaziv: string;
}

export default function NoviTerminObrazac({
  isOpen,
  onClose,
  onSubmit,
  objektNaziv,
}: Props) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-blue-50 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Novi Termini
          </h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Upravljanje objektom:{" "}
            <span className="text-blue-600 font-bold">{objektNaziv}</span>
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
              Datum termina
            </label>
            <input
              type="date"
              value={formData.datumPocetka}
              onChange={(e) =>
                setFormData({ ...formData, datumPocetka: e.target.value })
              }
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/70 focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Početak
              </label>
              <input
                type="time"
                value={formData.vrijemePocetka}
                onChange={(e) =>
                  setFormData({ ...formData, vrijemePocetka: e.target.value })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/70 focus:blue-600 outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Kraj
              </label>
              <input
                type="time"
                value={formData.vrijemeKraja}
                onChange={(e) =>
                  setFormData({ ...formData, vrijemeKraja: e.target.value })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/70 focus:blue-600 outline-none transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
              Cijena (€)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.cijena}
              onChange={(e) =>
                setFormData({ ...formData, cijena: e.target.value })
              }
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/70 focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
            />
          </div>

          {/* RECURRING LOGIKA */}
          <div
            className={`p-5 rounded-[24px] border-2 transition-all ${formData.recurring ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-slate-50"}`}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) =>
                  setFormData({ ...formData, recurring: e.target.checked })
                }
                className="w-5 h-5 accent-blue-600 rounded-lg"
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Ponavljaj tjedno
              </span>
            </label>

            {formData.recurring && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                  Ponavljaj do datuma
                </label>
                <input
                  type="date"
                  value={formData.ponavljajDo}
                  onChange={(e) =>
                    setFormData({ ...formData, ponavljajDo: e.target.value })
                  }
                  className="w-full p-3 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-600 font-bold text-slate-700"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all"
            >
              Odustani
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-600/20"
            >
              Dodaj Termine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
