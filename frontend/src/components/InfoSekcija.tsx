import type { InfoSekcijaProps } from "../types";
interface ProširenaInfoSekcijaProps extends InfoSekcijaProps {
  slikaUrl?: string;
}

export default function InfoSekcija({
  slikaUrl,
  adresa,
  kvart,
  kapacitet,
  klub,
  opis,
}: ProširenaInfoSekcijaProps) {
  const finalnaSlika =
    slikaUrl ||
    `https://loremflickr.com/800/600/stadium,sports?lock=${adresa.length}`;

  return (
    <div className="bg-white p-5 rounded-[32px] border border-blue-50 shadow-xl shadow-blue-900/5 space-y-6">
      <div className="w-full h-[25rem] rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner">
        <img
          src={finalnaSlika}
          alt={`Slika objekta na adresi ${adresa}`}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="px-3">
        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-5 text-center lg:text-left">
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

      {/* OPIS */}
      <div className="pt-6 px-3 border-t border-slate-100">
        <p className="text-slate-500 leading-relaxed italic text-sm text-center lg:text-left">
          "{opis}"
        </p>
      </div>
    </div>
  );
}
