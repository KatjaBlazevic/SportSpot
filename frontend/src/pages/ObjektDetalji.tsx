import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { DetaljiObjekta } from "../types/index.ts";
import InfoSekcija from "../components/InfoSekcija";
import TerminKartica from "../components/TerminKartica";
import RecenzijaKartica from "../components/RecenzijaKartica";

export default function ObjektDetalji() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetaljiObjekta | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/objekti/${id}`)
      .then((res) => res.json())
      .then((json: DetaljiObjekta) => setData(json))
      .catch((err) => console.error("Greška:", err));
  }, [id]);

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-tighter">
        Učitavanje...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* NASLOV */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
            {data.naziv}
          </h1>
          <div className="mt-4 flex justify-center gap-2">
            {data.sportovi.map((s) => (
              <span
                key={s}
                className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-5 space-y-8">
            <InfoSekcija
              adresa={data.adresa}
              kvart={data.kvart}
              kapacitet={data.kapacitet}
              klub={data.nazivKluba}
              opis={data.opis}
            />

            <div className="bg-white p-8 rounded-[32px] border border-blue-50 shadow-xl shadow-blue-900/5">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 text-center">
                Slobodni termini
              </h3>
              <div className="space-y-3">
                {data.termini && data.termini.length > 0 ? (
                  data.termini.map((t) => (
                    <TerminKartica
                      key={t.id}
                      id={t.id}
                      datum={t.datum}
                      vrijemePocetka={t.vrijemePocetka}
                      vrijemeKraja={t.vrijemeKraja}
                      cijena={t.cijena}
                      status={t.status}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-medium italic">
                      Trenutno nema slobodnih termina
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLIKA */}
          <div className="lg:col-span-7 h-[35rem] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
            <img
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              alt={data.naziv}
            />
          </div>
        </div>

        <section className="bg-white p-10 rounded-[40px] border border-blue-50 shadow-xl shadow-blue-900/5">
          {data.brojRecenzija > 0 ? (
            <div className="flex justify-between items-end mb-10 pb-8 border-b border-slate-50">
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">
                  Dojmovi igrača
                </p>
                <h2 className="text-5xl font-black text-slate-800 mt-2">
                  ⭐ {data.ocjena}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
                  Baza od {data.brojRecenzija} recenzija
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center lg:text-left">
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                Dojmovi igrača
              </p>
              <h2 className="text-2xl font-bold text-slate-400 mt-2">
                Još nema ocjena
              </h2>
            </div>
          )}

          {data.recenzije && data.recenzije.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.recenzije.map((r, i) => (
                <RecenzijaKartica key={i} r={r} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="text-4xl mb-4 opacity-50">💬</div>
              <p className="text-slate-400 font-medium italic">
                Postani prvi koji će ostaviti recenziju!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
