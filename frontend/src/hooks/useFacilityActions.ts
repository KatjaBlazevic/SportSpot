
export type NewSlotsData = {
  datumPocetka: string;
  vrijemePocetka: string;
  vrijemeKraja: string;
  cijena: string;
  recurring: boolean;
  ponavljajDo: string;
};

type UseFacilityActionsProps = {
  facilityId: number | undefined;
  onReviewSuccess: () => void;
  onSlotsSuccess: () => void;
};

export default function useFacilityActions({
  facilityId,
  onReviewSuccess,
  onSlotsSuccess,
}: UseFacilityActionsProps) {
  const submitReview = async (rating: number, comment: string) => {
    try {
      const token = localStorage.getItem("sportspot_token");

      if (!token) {
        alert("Moraš biti prijavljen da bi ostavio recenziju!");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/objekti/recenzije/nova",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idObjekta: facilityId,
            ocjena: rating,
            komentar: comment,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("WOOHOO! Recenzija je objavljena.");
        onReviewSuccess();
        window.location.reload();
      } else {
        alert(result.error || "Došlo je do pogreške.");
      }
    } catch (error) {
      console.error("Greška pri slanju recenzije:", error);
      alert("Server nije dostupan.");
    }
  };

  const submitSlots = async (slotsData: NewSlotsData) => {
    try {
      const token = localStorage.getItem("sportspot_token");

      const response = await fetch(
        "http://localhost:5000/api/termini/dodaj",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...slotsData,
            idObjekta: facilityId,
          }),
        },
      );

      if (response.ok) {
        alert("Termini uspješno dodani!");
        onSlotsSuccess();
        window.location.reload();
      } else {
        const result = await response.json();
        alert(result.error || "Greška pri dodavanju termina.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    submitReview,
    submitSlots,
  };
}
