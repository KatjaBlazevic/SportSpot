import type { ReactNode } from "react";

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

type DialogShellProps = {
  children: ReactNode;
  zIndex?: "z-[100]" | "z-[110]" | "z-[120]";
};

function DialogShell({ children, zIndex = "z-[100]" }: DialogShellProps) {
  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-text-primary/60 p-4 backdrop-blur-sm`}
    >
      <div className="sport-modal animate-in fade-in zoom-in w-full max-w-sm rounded-3xl p-8 transition-all duration-200">
        {children}
      </div>
    </div>
  );
}

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
        <DialogShell>
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary">
              📅
            </div>

            <h3 className="mb-2 text-xl font-black text-text-primary">
              Potvrda rezervacije
            </h3>

            <p className="mb-6 text-sm text-text-secondary">
              Želite li rezervirati termin u{" "}
              <span className="font-bold text-text-primary">{startTime}h</span>{" "}
              dana{" "}
              <span className="font-bold text-text-primary">
                {formattedDate}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCloseBooking}
                className="btn-secondary flex-1 rounded-xl px-4 py-3 font-bold"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={onConfirmBooking}
                className="btn-primary flex-1 rounded-xl px-4 py-3 font-bold shadow-sport-primary active:scale-95"
              >
                Rezerviraj
              </button>
            </div>
          </div>
        </DialogShell>
      )}

      {isCancellationOpen && isMySlot && (
        <DialogShell>
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger-soft text-2xl text-danger">
              🗑️
            </div>

            <h3 className="mb-2 text-xl font-black text-text-primary">
              Otkaži rezervaciju
            </h3>

            <p className="mb-6 text-sm text-text-secondary">
              Jeste li sigurni da želite otkazati termin u{" "}
              <span className="font-bold text-danger">{startTime}h</span> dana{" "}
              <span className="font-bold text-text-primary">
                {formattedDate}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCloseCancellation}
                className="btn-secondary flex-1 rounded-xl px-4 py-3 font-bold"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={onConfirmCancellation}
                className="btn-danger flex-1 rounded-xl px-4 py-3 font-bold active:scale-95"
              >
                Otkaži
              </button>
            </div>
          </div>
        </DialogShell>
      )}

      {isEditingOpen && (
        <DialogShell zIndex="z-[110]">
          <div className="mb-6 flex items-start justify-between">
            <h3 className="text-xl font-black tracking-tight text-text-primary uppercase">
              Uredi termin
            </h3>

            <button
              type="button"
              onClick={onDeleteSlot}
              aria-label="Obriši termin"
              className="cursor-pointer rounded-xl p-2 text-danger transition-colors hover:bg-danger-soft"
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
              <label className="sport-label ml-1 text-[10px] font-black uppercase text-text-muted">
                Cijena (€)
              </label>

              <input
                type="number"
                value={newPrice}
                onChange={(event) =>
                  onNewPriceChange(Number(event.target.value))
                }
                className="sport-input mt-1 rounded-xl p-3 font-bold"
              />
            </div>

            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <label className="sport-label ml-1 text-[10px] font-black uppercase text-text-muted">
                  Početak
                </label>

                <input
                  type="time"
                  value={newStartTime}
                  onChange={(event) => onNewStartTimeChange(event.target.value)}
                  className="sport-input mt-1 rounded-xl p-3"
                />
              </div>

              <div className="min-w-0 flex-1">
                <label className="sport-label ml-1 text-[10px] font-black uppercase text-text-muted">
                  Kraj
                </label>

                <input
                  type="time"
                  value={newEndTime}
                  onChange={(event) => onNewEndTimeChange(event.target.value)}
                  className="sport-input mt-1 rounded-xl p-3"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onCloseEditing}
                className="btn-secondary flex-1 rounded-xl px-4 py-3 font-bold"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={onSaveChanges}
                className="btn-primary flex-1 rounded-xl px-4 py-3 text-xs font-black uppercase"
              >
                Spremi
              </button>
            </div>
          </div>
        </DialogShell>
      )}

      {isGuestBookingOpen && isAvailable && (
        <DialogShell zIndex="z-[120]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-soft text-2xl text-primary">
              📧
            </div>

            <h3 className="mb-2 text-xl font-black text-text-primary uppercase italic">
              Brza Rezervacija
            </h3>

            <p className="mb-6 text-sm text-text-secondary">
              Niste prijavljeni? Nema problema. Unesite email i termin je vaš!
            </p>

            <div className="mb-6">
              <input
                type="email"
                placeholder="Vaš email adresa..."
                aria-label="Email adresa za brzu rezervaciju"
                value={guestEmail}
                onChange={(event) => onGuestEmailChange(event.target.value)}
                className="sport-input rounded-2xl p-4 text-center font-bold"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCloseGuestBooking}
                className="btn-secondary flex-1 rounded-xl px-4 py-3 font-bold"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={onConfirmGuestBooking}
                className="btn-primary flex-1 rounded-xl px-4 py-4 text-xs font-black uppercase shadow-sport-primary active:scale-95"
              >
                Potvrdi
              </button>
            </div>
          </div>
        </DialogShell>
      )}
    </>
  );
}
