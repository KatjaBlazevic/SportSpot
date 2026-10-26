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
          if (jeVlasnikObjekta) {
            setIsUrediPopupOpen(true);
            return;
          }

          if (jeProslost) {
            return;
          }

          if (korisnik && jeMojTermin) {
            setIsOtkaziPopupOpen(true);
            return;
          }

          if (jeSlobodan) {
            if (korisnik) {
              setIsPopupOpen(true);
            } else {
              setIsGostPopupOpen(true);
            }
            return;
          }
        }}
        className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border p-5 transition-all ${
          jeSlobodan
            ? "cursor-pointer border-border-light bg-surface-soft hover:border-primary-light hover:bg-surface hover:shadow-sport-card"
            : jeMojTermin
              ? "cursor-pointer border-primary-border bg-primary-soft hover:border-danger hover:bg-surface hover:shadow-sport-card"
              : "cursor-not-allowed border-border-default bg-background opacity-75"
        }`}
      >
        {!jeProslost && (jeSlobodan || jeMojTermin || jeVlasnikObjekta) && (
          <div
            className={`absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${
              jeVlasnikObjekta
                ? "bg-text-primary/90"
                : jeMojTermin
                  ? "bg-danger/90"
                  : "bg-primary/90"
            }`}
          >
            <p className="translate-y-2 text-sm font-black tracking-widest text-text-inverse uppercase transition-transform group-hover:translate-y-0">
              {jeVlasnikObjekta
                ? "Uredi termin"
                : jeMojTermin
                  ? "Otkaži rezervaciju"
                  : "Rezerviraj termin"}
            </p>
          </div>
        )}

        {jeProslost && jeVlasnikObjekta && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-text-primary/90 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="translate-y-2 text-sm font-black tracking-widest text-text-inverse uppercase transition-transform group-hover:translate-y-0">
              Uredi prošli termin ⚙️
            </p>
          </div>
        )}

        <div className="text-left">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[10px] font-bold text-text-muted uppercase">
              {new Date(datum).toLocaleDateString("hr-HR")}
            </p>

            <span
              className={`rounded-md border px-2 py-0.5 text-[8px] font-black tracking-tighter uppercase ${
                jeSlobodan
                  ? "badge-success border-success"
                  : jeMojTermin
                    ? "border-primary bg-primary-soft text-primary"
                    : "badge-danger border-danger-border"
              }`}
            >
              {jeMojTermin ? "Moja Rezervacija" : status}
            </span>
          </div>

          <p
            className={`text-lg font-black ${
              jeSlobodan || jeMojTermin
                ? "text-text-primary"
                : "text-text-secondary line-through"
            }`}
          >
            {vrijemePocetka} — {vrijemeKraja}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-2xl font-black ${
              jeSlobodan || jeMojTermin ? "text-primary" : "text-text-muted"
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
