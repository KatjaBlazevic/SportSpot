import { useState } from "react";
import type { Termin } from "../../types";
import { useAuth } from "../../context/useAuth";
import TimeSlotDialogs from "./TimeSlotDialogs";
interface TimeSlotCardProps extends Termin {
  onRezervacija?: () => void;
  jeMojTermin?: boolean;
  jeVlasnikObjekta?: boolean;
}

export default function TimeSlotCard({
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
}: TimeSlotCardProps) {
  //popupovi
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOtkaziPopupOpen, setIsOtkaziPopupOpen] = useState(false);
  const [isUrediPopupOpen, setIsUrediPopupOpen] = useState(false);
  const [isGostPopupOpen, setIsGostPopupOpen] = useState(false);
  const [emailGosta, setEmailGosta] = useState("");

  const trenutno = new Date();
  const datumTermina = new Date(datum);
  const [sati, minute] = vrijemePocetka.split(":").map(Number);
  datumTermina.setHours(sati, minute, 0, 0);

  //korisnik i navigacija
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

  const handleRezervacijaGosta = async () => {
    if (!emailGosta || !emailGosta.includes("@")) {
      alert("Molimo unesite ispravan email.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/termini/rezerviraj-gost/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailGosta }),
        },
      );

      if (response.ok) {
        setIsGostPopupOpen(false);
        if (onRezervacija) onRezervacija();
        alert("Termin rezerviran! Provjerite svoj email.");
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
          //Ako je vlasnik objekta - otvori uredi popup
          if (jeVlasnikObjekta) {
            setIsUrediPopupOpen(true);
            return;
          }

          //Ako je termin u prošlosti - ne dozvoli nikakvu akciju
          if (jeProslost) {
            return;
          }

          //Ako je korisnik ulogiran i to je njegov termin - otvori otkazivanje
          if (korisnik && jeMojTermin) {
            setIsOtkaziPopupOpen(true);
            return;
          }

          //Ako je termin slobodan
          if (jeSlobodan) {
            if (korisnik) {
              // Logiran je  - standardna potvrda
              setIsPopupOpen(true);
            } else {
              // Nije logiran - unos emaila
              setIsGostPopupOpen(true);
            }
            return;
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

     
      <TimeSlotDialogs
        date={datum}
        startTime={vrijemePocetka}
        isAvailable={jeSlobodan}
        isMySlot={Boolean(jeMojTermin)}
        isBookingOpen={isPopupOpen}
        isCancellationOpen={isOtkaziPopupOpen}
        isEditingOpen={isUrediPopupOpen}
        isGuestBookingOpen={isGostPopupOpen}
        guestEmail={emailGosta}
        onGuestEmailChange={setEmailGosta}
        newPrice={novaCijena}
        onNewPriceChange={setNovaCijena}
        newStartTime={novoVrijemePocetka}
        onNewStartTimeChange={setNovoVrijemePocetka}
        newEndTime={novoVrijemeKraja}
        onNewEndTimeChange={setNovoVrijemeKraja}
        onCloseBooking={() => setIsPopupOpen(false)}
        onCloseCancellation={() => setIsOtkaziPopupOpen(false)}
        onCloseEditing={() => setIsUrediPopupOpen(false)}
        onCloseGuestBooking={() => setIsGostPopupOpen(false)}
        onConfirmBooking={handlePotvrdiRezervaciju}
        onConfirmCancellation={handlePotvrdiOtkazivanje}
        onSaveChanges={handleSpremiIzmjene}
        onDeleteSlot={handleObrisiTermin}
        onConfirmGuestBooking={handleRezervacijaGosta}
      />

    </>
  );
}
