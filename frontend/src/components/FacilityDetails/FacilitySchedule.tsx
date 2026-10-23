
import { useState } from "react";
import type { Termin } from "../../types";
import TerminKartica from "../TerminKartica";

type FacilityScheduleProps = {
  slots: Termin[];
  currentUserId: number | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  onAddSlot: () => void;
  onRefresh: () => void;
};

function getCurrentMonday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const difference = date.getDate() - day + (day === 0 ? -6 : 1);

  date.setDate(difference);
  return date;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function FacilitySchedule({
  slots,
  currentUserId,
  isAuthenticated,
  isOwner,
  onAddSlot,
  onRefresh,
}: FacilityScheduleProps) {
  const [currentMonday, setCurrentMonday] = useState(getCurrentMonday);

  const sunday = new Date(currentMonday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startDate = currentMonday.toLocaleDateString("sv-SE");
  const endDate = sunday.toLocaleDateString("sv-SE");

  const visibleSlots = slots
    .filter((slot) => {
      const slotDate = new Date(slot.datum).toLocaleDateString("sv-SE");
      return slotDate >= startDate && slotDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.datum).getTime();
      const dateB = new Date(b.datum).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return a.vrijemePocetka.localeCompare(b.vrijemePocetka);
    });

  const changeWeek = (direction: number) => {
    setCurrentMonday((previous) => {
      const nextMonday = new Date(previous);
      nextMonday.setDate(nextMonday.getDate() + direction * 7);
      return nextMonday;
    });
  };

  const leaveWaitingList = async (slotId: number) => {
    try {
      const token = localStorage.getItem("sportspot_token");

      const response = await fetch(
        `http://localhost:5000/api/termini/lista-cekanja/odustani/${slotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Greška pri odustajanju.");
      }
    } catch (error) {
      console.error("Greška:", error);
      alert("Server nije dostupan.");
    }
  };

  const joinWaitingList = async (slotId: number) => {
    try {
      const token = localStorage.getItem("sportspot_token");

      const response = await fetch(
        "http://localhost:5000/api/termini/lista-cekanja/prijava",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idTermina: slotId,
          }),
        },
      );

      if (response.ok) {
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Greška pri prijavi.");
      }
    } catch (error) {
      console.error("Greška:", error);
      alert("Server nije dostupan.");
    }
  };

  return (
    <div className="lg:col-span-1 lg:col-start-1 lg:row-span-2">
      <section className="rounded-[32px] border border-primary-soft bg-surface p-4 shadow-xl shadow-blue-900/5 sm:p-8">
        <div
          className={`mx-auto mb-6 flex items-center p-4 transition-colors ${
            isOwner
              ? "w-full justify-between bg-surface sm:w-[90%]"
              : "w-full justify-center"
          }`}
        >
          <h2 className="text-center text-base font-black tracking-[0.2em] text-primary-light uppercase">
            Termini
          </h2>

          {isOwner && (
            <button
              type="button"
              onClick={onAddSlot}
              className="flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-xs font-black text-white uppercase shadow-lg shadow-blue-600/20 transition-all hover:scale-105 hover:bg-primary-hover active:scale-95"
            >
              <span>Dodaj</span>
              <span className="text-lg">+</span>
            </button>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-border-light bg-background p-3">
          <button
            type="button"
            onClick={() => changeWeek(-1)}
            aria-label="Prethodni tjedan"
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-surface font-bold text-primary shadow-sm transition-colors hover:bg-primary-soft"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">
              Tjedni pregled
            </p>

            <p className="text-sm font-black text-text-primary">
              {formatDate(currentMonday)} - {formatDate(sunday)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => changeWeek(1)}
            aria-label="Sljedeći tjedan"
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-surface font-bold text-primary shadow-sm transition-colors hover:bg-primary-soft"
          >
            →
          </button>
        </div>

        <div className="space-y-3">
          {visibleSlots.length > 0 ? (
visibleSlots.map((slot) => {
  const slotStart = new Date(slot.datum);
  const [hours, minutes] = slot.vrijemePocetka.split(":").map(Number);

  slotStart.setHours(hours, minutes, 0, 0);

  const isPastSlot = slotStart <= new Date();

  const isMySlot = Boolean(
    slot.status !== "Slobodan" &&
      currentUserId &&
      Number(slot.idKorisnika) === currentUserId,
  );

              const waitingListIds = slot.lista_ids || [];
              const waitingListPosition = waitingListIds.indexOf(
                currentUserId ?? -1,
              );
              const isOnWaitingList = waitingListPosition !== -1;

              return (
                <div key={slot.id} className="relative">
                  <TerminKartica
                    id={slot.id}
                    idKorisnika={slot.idKorisnika}
                    datum={slot.datum}
                    vrijemePocetka={slot.vrijemePocetka}
                    vrijemeKraja={slot.vrijemeKraja}
                    cijena={slot.cijena}
                    status={slot.status}
                    lista_ids={slot.lista_ids}
                    onRezervacija={onRefresh}
                    jeMojTermin={isMySlot}
                    jeVlasnikObjekta={isOwner}
                  />

{slot.status !== "Slobodan" &&
  !isPastSlot &&
  isAuthenticated &&
  !isMySlot &&
  !isOwner && (
                      <div className="mt-2 w-full">
                        {isOnWaitingList ? (
                          <div className="flex w-full items-center gap-2">
                            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2 shadow-inner">
                              <span className="text-[10px] font-black tracking-tight text-amber-800 uppercase">
                                {waitingListPosition + 1}. na listi čekanja
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={async (event) => {
                                event.stopPropagation();

                                if (
                                  window.confirm(
                                    "Želiš li se maknuti s liste čekanja?",
                                  )
                                ) {
                                  await leaveWaitingList(slot.id);
                                }
                              }}
                              className="cursor-pointer whitespace-nowrap rounded-xl border border-red-200 bg-surface px-4 py-2 text-[10px] font-black text-red-600 uppercase transition-colors hover:bg-red-50"
                            >
                              Otkaži
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={async (event) => {
                              event.stopPropagation();
                              await joinWaitingList(slot.id);
                            }}
                            className="w-full cursor-pointer rounded-xl bg-amber-500 py-2.5 text-[10px] font-black text-white uppercase shadow-lg shadow-amber-900/20 transition-all hover:bg-amber-600 active:scale-[0.98]"
                          >
                            Prijava na listu čekanja
                          </button>
                        )}
                      </div>
                    )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border-default bg-background py-8 text-center">
              <p className="text-sm font-medium text-text-muted italic">
                Nema termina ovaj tjedan
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
