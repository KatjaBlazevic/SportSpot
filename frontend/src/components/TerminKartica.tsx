import { useState } from "react";
import type { Termin } from "../types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
interface TerminKarticaProps extends Termin {
  onRezervacija?: () => void;
  jeMojTermin?: boolean;
  jeVlasnikObjekta?: boolean;
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
  jeVlasnikObjekta,
  idKorisnika,
  lista_ids,
}: TerminKarticaProps) {
  //popupovi
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOtkaziPopupOpen, setIsOtkaziPopupOpen] = useState(false);
  const [isUrediPopupOpen, setIsUrediPopupOpen] = useState(false);

  const trenutno = new Date();
  const datumTermina = new Date(datum);
  const [sati, minute] = vrijemePocetka.split(":").map(Number);
  datumTermina.setHours(sati, minute, 0, 0);

  //korisnik i navigacija
  const navigate = useNavigate();
  const { korisnik } = useAuth();

  //Definiranje za izmjenu termina
  const [novaCijena, setNovaCijena] = useState(cijena);
  const [novoVrijemePocetka, setNovoVrijemePocetka] = useState(vrijemePocetka);
  const [novoVrijemeKraja, setNovoVrijemeKraja] = useState(vrijemeKraja);

  const jeProslost = datumTermina < trenutno;
  const jeSlobodan = status === "Slobodan" && !jeProslost;
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

  const handleSpremiIzmjene = async () => {
    try {
      const token = localStorage.getItem("sportspot_token");
      const response = await fetch(
        `http://localhost:5000/api/termini/uredi/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vrijemePocetka: novoVrijemePocetka,
            vrijemeKraja: novoVrijemeKraja,
            cijena: novaCijena,
          }),
        },
      );

      if (response.ok) {
        setIsUrediPopupOpen(false);
        if (onRezervacija) onRezervacija(); // Osvježava listu u ObjektDetalji
      } else {
        const data = await response.json();
        alert(data.error || "Greška pri spremanju.");
      }
    } catch (err) {
      alert("Server nedostupan.");
    }
  };

  const handleObrisiTermin = async () => {
    if (
      !window.confirm("Jeste li sigurni da želite trajno obrisati ovaj termin?")
    )
      return;

    try {
      const token = localStorage.getItem("sportspot_token");
      const response = await fetch(
        `http://localhost:5000/api/termini/obrisi/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setIsUrediPopupOpen(false);
        if (onRezervacija) onRezervacija();
      } else {
        const data = await response.json();
        alert(data.error || "Greška pri brisanju.");
      }
    } catch (err) {
      alert("Server nedostupan.");
    }
  };

  return (
    <>
      <div
        onClick={() => {
          // ako nema reg korisnika vodi na prijavu
          if (!korisnik) {
            navigate("/prijava");
            return;
          }

          //Ako je vlasnik ovog objekta
          if (jeVlasnikObjekta) {
            setIsUrediPopupOpen(true);
          }
          //Ako je kor reg i termin je isteko, slobodan ili njegova rezervacija
          else if (jeProslost) {
            return;
          } else if (jeSlobodan) {
            setIsPopupOpen(true);
          } else if (jeMojTermin) {
            setIsOtkaziPopupOpen(true);
          }
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
        {!jeProslost && (jeSlobodan || jeMojTermin || jeVlasnikObjekta) && (
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 
    ${jeVlasnikObjekta ? "bg-slate-800/90" : jeMojTermin ? "bg-red-600/90" : "bg-blue-600/90"}`}
          >
            <p className="text-white font-black tracking-widest text-sm uppercase translate-y-2 group-hover:translate-y-0 transition-transform">
              {jeVlasnikObjekta
                ? "Uredi termin"
                : jeMojTermin
                  ? "Otkaži rezervaciju"
                  : "Rezerviraj termin"}
            </p>
          </div>
        )}

        {jeProslost && jeVlasnikObjekta && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 bg-slate-800/90">
            <p className="text-white font-black tracking-widest text-sm uppercase translate-y-2 group-hover:translate-y-0 transition-transform">
              Uredi prošli termin ⚙️
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
      {isUrediPopupOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Uredi termin
              </h3>

              {/* Gumb za brisanje */}
              <button
                onClick={handleObrisiTermin}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Cijena (€)
                </label>
                <input
                  type="number"
                  value={novaCijena}
                  onChange={(e) => setNovaCijena(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold mt-1"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Početak
                  </label>
                  <input
                    type="time"
                    value={novoVrijemePocetka}
                    onChange={(e) => setNovoVrijemePocetka(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Kraj
                  </label>
                  <input
                    type="time"
                    value={novoVrijemeKraja}
                    onChange={(e) => setNovoVrijemeKraja(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setIsUrediPopupOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Odustani
                </button>
                <button
                  onClick={handleSpremiIzmjene}
                  className="flex-1 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-xl hover:bg-black shadow-lg"
                >
                  Spremi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
