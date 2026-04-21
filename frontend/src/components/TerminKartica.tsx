import type { Termin } from "../types";

export default function TerminKartica({
  datum,
  vrijemePocetka,
  vrijemeKraja,
  cijena,
}: Termin) {
  return (
    <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-lg transition-all group">
      <div className="text-left">
        <p className="text-[10px] font-bold text-slate-400 uppercase">
          {new Date(datum).toLocaleDateString("hr-HR")}
        </p>
        <p className="text-lg font-black text-slate-800 group-hover:text-blue-600">
          {vrijemePocetka} — {vrijemeKraja}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-blue-600">{cijena}€</p>
      </div>
    </button>
  );
}
