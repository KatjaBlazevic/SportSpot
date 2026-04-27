import type { Termin } from "../types";

export default function TerminKartica({
  datum,
  vrijemePocetka,
  vrijemeKraja,
  cijena,
  status,
}: Termin) {
  const jeSlobodan = status === "Slobodan";
  return (
    <button
      disabled={!jeSlobodan}
      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all group relative
        ${
          jeSlobodan
            ? "bg-slate-50 border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-lg"
            : "bg-slate-100 border-slate-200 cursor-not-allowed opacity-75 shadow-inner"
        }`}
    >
      <div className="text-left">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            {new Date(datum).toLocaleDateString("hr-HR")}
          </p>

          {/* Prikaz statusa termina */}
          <span
            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
              jeSlobodan
                ? "bg-green-100 text-green-600 border border-green-200"
                : "bg-red-100 text-red-600 border border-red-200"
            }`}
          >
            {status}
          </span>
        </div>

        <p
          className={`text-lg font-black transition-colors ${
            jeSlobodan
              ? "text-slate-800 group-hover:text-blue-600"
              : "text-slate-500 line-through decoration-slate-300"
          }`}
        >
          {vrijemePocetka} — {vrijemeKraja}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-2xl font-black ${
            jeSlobodan ? "text-blue-600" : "text-slate-400"
          }`}
        >
          {cijena}€
        </p>
      </div>
    </button>
  );
}
