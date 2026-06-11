import type { Recenzija } from "../types/index.ts";

export default function RecenzijaKartica({ r }: { r: Recenzija }) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-slate-200"}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="p-6 bg-slate-50 rounded-3xl border  border-slate-100 hover:border-blue-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
            {r.ime[0]}
            {r.prezime[0]}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">
              {r.ime} {r.prezime}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {new Date(r.datumObjave).toLocaleDateString("hr-HR")}
            </p>
          </div>
        </div>
        <div className="flex text-lg">{renderStars(r.ocjena)}</div>
      </div>
      <p className="text-slate-600 text-sm italic leading-relaxed">
        "{r.komentar}"
      </p>
    </div>
  );
}
