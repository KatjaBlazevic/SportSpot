import { useState, useEffect } from "react";

interface Props {
  onWeekChange: (start: Date, end: Date) => void;
}

export default function TjedniFilter({ onWeekChange }: Props) {
  const [trenutniPonedjeljak, setTrenutniPonedjeljak] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  useEffect(() => {
    const nedjelja = new Date(trenutniPonedjeljak);
    nedjelja.setDate(nedjelja.getDate() + 6);
    nedjelja.setHours(23, 59, 59, 999);

    // Šaljemo samo ako se ponedjeljak stvarno promijenio
    onWeekChange(trenutniPonedjeljak, nedjelja);
  }, [trenutniPonedjeljak]);

  const promjeniTjedan = (smjer: number) => {
    const noviDatum = new Date(trenutniPonedjeljak);
    noviDatum.setDate(noviDatum.getDate() + smjer * 7);
    setTrenutniPonedjeljak(noviDatum);
  };

  const formatirajDatum = (date: Date) => {
    return date.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const krajTjednaZaPrikaz = new Date(trenutniPonedjeljak);
  krajTjednaZaPrikaz.setDate(krajTjednaZaPrikaz.getDate() + 6);

  return (
    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6">
      <button
        type="button"
        onClick={() => promjeniTjedan(-1)}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-blue-50 transition-colors text-blue-600 font-bold"
      >
        ←
      </button>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          Tjedni pregled
        </p>
        <p className="text-sm font-black text-slate-700">
          {formatirajDatum(trenutniPonedjeljak)} -{" "}
          {formatirajDatum(krajTjednaZaPrikaz)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => promjeniTjedan(1)}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-blue-50 transition-colors text-blue-600 font-bold"
      >
        →
      </button>
    </div>
  );
}
