import { useState } from "react";
import type { Termin } from "../types";

interface TerminKarticaProps extends Termin {
  onRezervacija?: () => void;
  jeMojTermin?: boolean;
}

export default function TerminKartica({
  id,
  datum,
  vrijemePocetka,
  vrijemeKraja,
  cijena,
  status,
  onRezervacija,
  jeMojTermin,
  idKorisnika,
}: TerminKarticaProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOtkaziPopupOpen, setIsOtkaziPopupOpen] = useState(false);
  const jeSlobodan = status === "Slobodan";

  const handlePotvrdiRezervaciju = async () => {
    try {
      const token = localStorage.getItem("sportspot_token");
      const response = await fetch(
        `http://localhost:5000/api/termini/rezerviraj/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setIsPopupOpen(false);
        if (onRezervacija) onRezervacija();
      } else {
        const data = await response.json();
        alert(data.error || "Greška pri rezervaciji.");
      }
    } catch (err) {
      alert("Server nije dostupan.");
    }
  };

  const handlePotvrdiOtkazivanje = async () => {
    try {
      const token = localStorage.getItem("sportspot_token");
      const response = await fetch(
        `http://localhost:5000/api/termini/otkazi/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ idKorisnika }),
        },
      );

      if (response.ok) {
        setIsOtkaziPopupOpen(false);
        if (onRezervacija) onRezervacija(); // Osvježava listu termina
      } else {
        const data = await response.json();
        alert(data.error || "Greška pri otkazivanju.");
      }
    } catch (err) {
      alert("Server nije dostupan.");
    }
  };

  return (
    <>
      <div
        onClick={() => {
          if (jeSlobodan) setIsPopupOpen(true);
          else if (jeMojTermin) setIsOtkaziPopupOpen(true);
        }}
        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all group relative overflow-hidden
      ${
        jeSlobodan
          ? "bg-slate-50 border-slate-100 cursor-pointer hover:border-blue-500 hover:bg-white hover:shadow-xl"
          : jeMojTermin
            ? "bg-blue-50 border-blue-200 cursor-pointer hover:border-red-500 hover:bg-white hover:shadow-xl"
            : "bg-slate-100 border-slate-200 cursor-not-allowed opacity-75"
      }`}
      >
        {(jeSlobodan || jeMojTermin) && (
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 
        ${jeMojTermin ? "bg-red-600/90" : "bg-blue-600/90"}`}
          >
            <p className="text-white font-black tracking-widest text-sm uppercase translate-y-2 group-hover:translate-y-0 transition-transform">
              {jeMojTermin ? "Otkaži rezervaciju" : "Rezerviraj termin"}
            </p>
          </div>
        )}

        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {new Date(datum).toLocaleDateString("hr-HR")}
            </p>
            <span
              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                jeSlobodan
                  ? "bg-green-100 text-green-600 border border-green-200"
                  : jeMojTermin
                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                    : "bg-red-100 text-red-600 border border-red-200"
              }`}
            >
              {jeMojTermin ? "Moja Rezervacija" : status}
            </span>
          </div>

          <p
            className={`text-lg font-black ${
              jeSlobodan || jeMojTermin
                ? "text-slate-800"
                : "text-slate-500 line-through"
            }`}
          >
            {vrijemePocetka} — {vrijemeKraja}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-2xl font-black ${
              jeSlobodan
                ? "text-blue-600"
                : jeMojTermin
                  ? "text-blue-700"
                  : "text-slate-400"
            }`}
          >
            {cijena}€
          </p>
        </div>
      </div>

      {isPopupOpen && jeSlobodan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                📅
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Potvrda rezervacije
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Želite li rezervirati termin u{" "}
                <span className="font-bold text-slate-700">
                  {vrijemePocetka}h
                </span>{" "}
                dana{" "}
                <span className="font-bold text-slate-700">
                  {new Date(datum).toLocaleDateString("hr-HR")}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
                >
                  Odustani
                </button>
                <button
                  onClick={handlePotvrdiRezervaciju}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Rezerviraj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOtkaziPopupOpen && jeMojTermin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🗑️
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Otkaži rezervaciju
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Jeste li sigurni da želite otkazati termin u{" "}
                <span className="font-bold text-red-700">
                  {vrijemePocetka}h
                </span>{" "}
                dana{" "}
                <span className="font-bold text-slate-700">
                  {new Date(datum).toLocaleDateString("hr-HR")}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOtkaziPopupOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors"
                >
                  Odustani
                </button>
                <button
                  onClick={handlePotvrdiOtkazivanje}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
