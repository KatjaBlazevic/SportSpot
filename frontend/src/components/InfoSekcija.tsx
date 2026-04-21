import type { InfoSekcijaProps } from "../types";

export default function InfoSekcija({
  adresa,
  kvart,
  kapacitet,
  klub,
  opis,
}: InfoSekcijaProps) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-blue-50 shadow-xl shadow-blue-900/5 space-y-6">
      <div>
        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">
          O objektu
        </h3>
        <div className="grid gap-4 text-slate-700">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-50 rounded-lg text-lg">📍</span>
            <p className="font-medium">
              {adresa}, <span className="text-slate-400">{kvart}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-50 rounded-lg text-lg">👥</span>
            <p className="font-medium">Kapacitet: {kapacitet} osoba</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-50 rounded-lg text-lg">🛡️</span>
            <p className="font-medium">Klub: {klub}</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <p className="text-slate-500 leading-relaxed italic text-sm text-center lg:text-left">
          "{opis}"
        </p>
      </div>
    </div>
  );
}
