
type TimeSlotDialogsProps = {
  date: string;
  startTime: string;
  isAvailable: boolean;
  isMySlot: boolean;

  isBookingOpen: boolean;
  isCancellationOpen: boolean;
  isEditingOpen: boolean;
  isGuestBookingOpen: boolean;

  guestEmail: string;
  onGuestEmailChange: (value: string) => void;

  newPrice: number;
  onNewPriceChange: (value: number) => void;
  newStartTime: string;
  onNewStartTimeChange: (value: string) => void;
  newEndTime: string;
  onNewEndTimeChange: (value: string) => void;

  onCloseBooking: () => void;
  onCloseCancellation: () => void;
  onCloseEditing: () => void;
  onCloseGuestBooking: () => void;

  onConfirmBooking: () => void;
  onConfirmCancellation: () => void;
  onSaveChanges: () => void;
  onDeleteSlot: () => void;
  onConfirmGuestBooking: () => void;
};

export default function TimeSlotDialogs({
  date,
  startTime,
  isAvailable,
  isMySlot,
  isBookingOpen,
  isCancellationOpen,
  isEditingOpen,
  isGuestBookingOpen,
  guestEmail,
  onGuestEmailChange,
  newPrice,
  onNewPriceChange,
  newStartTime,
  onNewStartTimeChange,
  newEndTime,
  onNewEndTimeChange,
  onCloseBooking,
  onCloseCancellation,
  onCloseEditing,
  onCloseGuestBooking,
  onConfirmBooking,
  onConfirmCancellation,
  onSaveChanges,
  onDeleteSlot,
  onConfirmGuestBooking,
}: TimeSlotDialogsProps) {
  const formattedDate = new Date(date).toLocaleDateString("hr-HR");

  return (
    <>
      {isBookingOpen && isAvailable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm scale-100 transform rounded-3xl bg-white p-8 shadow-2xl transition-all duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
                📅
              </div>

              <h3 className="mb-2 text-xl font-black text-slate-900">
                Potvrda rezervacije
              </h3>

              <p className="mb-6 text-sm text-slate-500">
                Želite li rezervirati termin u{" "}
                <span className="font-bold text-slate-700">
                  {startTime}h
                </span>{" "}
                dana{" "}
                <span className="font-bold text-slate-700">
                  {formattedDate}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCloseBooking}
                  className="flex-1 rounded-xl px-4 py-3 font-bold text-slate-500 transition-colors hover:bg-slate-100"
                >
                  Odustani
                </button>

                <button
                  type="button"
                  onClick={onConfirmBooking}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
                >
                  Rezerviraj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCancellationOpen && isMySlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm scale-100 transform rounded-3xl bg-white p-8 shadow-2xl transition-all duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                🗑️
              </div>

              <h3 className="mb-2 text-xl font-black text-slate-900">
                Otkaži rezervaciju
              </h3>

              <p className="mb-6 text-sm text-slate-500">
                Jeste li sigurni da želite otkazati termin u{" "}
                <span className="font-bold text-red-700">
                  {startTime}h
                </span>{" "}
                dana{" "}
                <span className="font-bold text-slate-700">
                  {formattedDate}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCloseCancellation}
                  className="flex-1 rounded-xl px-4 py-3 font-bold text-slate-500 transition-colors hover:bg-slate-100"
                >
                  Odustani
                </button>

                <button
                  type="button"
                  onClick={onConfirmCancellation}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditingOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl duration-200">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Uredi termin
              </h3>

              <button
                type="button"
                onClick={onDeleteSlot}
                aria-label="Obriši termin"
                className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6"
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
                <label className="ml-1 text-[10px] font-black text-slate-400 uppercase">
                  Cijena (€)
                </label>

                <input
                  type="number"
                  value={newPrice}
                  onChange={(event) =>
                    onNewPriceChange(Number(event.target.value))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-bold"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="ml-1 text-[10px] font-black text-slate-400 uppercase">
                    Početak
                  </label>

                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(event) =>
                      onNewStartTimeChange(event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 p-3"
                  />
                </div>

                <div className="flex-1">
                  <label className="ml-1 text-[10px] font-black text-slate-400 uppercase">
                    Kraj
                  </label>

                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(event) =>
                      onNewEndTimeChange(event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 p-3"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={onCloseEditing}
                  className="flex-1 rounded-xl py-3 font-bold text-slate-500 hover:bg-slate-50"
                >
                  Odustani
                </button>

                <button
                  type="button"
                  onClick={onSaveChanges}
                  className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-black text-white uppercase shadow-lg hover:bg-black"
                >
                  Spremi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGuestBookingOpen && isAvailable && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
                📧
              </div>

              <h3 className="mb-2 text-xl font-black text-slate-900 uppercase italic">
                Brza Rezervacija
              </h3>

              <p className="mb-6 text-sm text-slate-500">
                Niste prijavljeni? Nema problema. Unesite email i termin je vaš!
              </p>

              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Vaš email adresa..."
                  value={guestEmail}
                  onChange={(event) =>
                    onGuestEmailChange(event.target.value)
                  }
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center font-bold outline-none transition-all focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCloseGuestBooking}
                  className="flex-1 rounded-xl px-4 py-3 font-bold text-slate-400 transition-colors hover:bg-slate-50"
                >
                  Odustani
                </button>

                <button
                  type="button"
                  onClick={onConfirmGuestBooking}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-4 text-xs font-black text-white uppercase shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
                >
                  Potvrdi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
