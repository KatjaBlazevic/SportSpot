import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import useFacilityDetails from "../hooks/useFacilityDetails";
import useFacilityFavorites from "../hooks/useFacilityFavorites";
import FacilityInfo from "../components/FacilityDetails/FacilityInfo";
import FacilitySchedule from "../components/FacilityDetails/FacilitySchedule";
import FacilityReviews from "../components/FacilityDetails/FacilityReviews";
import ReviewForm from "../components/FacilityDetails/ReviewForm";
import NewSlotsForm from "../components/FacilityDetails/NewSlotsForm";
import FacilityHeader from "../components/FacilityDetails/FacilityHeader";

export default function ObjektDetalji() {
  const { id } = useParams<{ id: string }>();
  const { korisnik } = useAuth();
  
  const { data, refetch } = useFacilityDetails(id);

  const { isFavorite, toggleFavorite } = useFacilityFavorites({
    facilityId: id,
    facilityName: data?.naziv ?? "",
    facilityAddress: data?.adresa ?? "",
    isAuthenticated: Boolean(korisnik),
  });

  const [isObrazacOpen, setIsObrazacOpen] = useState(false);
  const [isTerminObrazacOpen, setIsTerminObrazacOpen] = useState(false);


  const handleRecenzijaSubmit = async (ocjena: number, komentar: string) => {
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
            idObjekta: data?.id,
            ocjena: ocjena,
            komentar: komentar,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("WOOHOO! Recenzija je objavljena.");
        setIsObrazacOpen(false);
        window.location.reload();
      } else {
        alert(result.error || "Došlo je do pogreške.");
      }
    } catch (error) {
      console.error("Greška pri slanju recenzije:", error);
      alert("Server nije dostupan.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTerminSubmit = async (terminData: any) => {
    try {
      const token = localStorage.getItem("sportspot_token");
      const response = await fetch("http://localhost:5000/api/termini/dodaj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...terminData,
          idObjekta: data?.id,
        }),
      });

      if (response.ok) {
        alert("Termini uspješno dodani!");
        setIsTerminObrazacOpen(false);
        window.location.reload();
      } else {
        const res = await response.json();
        alert(res.error || "Greška pri dodavanju termina.");
      }
    } catch (err) {
      console.error(err);
    }
  };



  if (!data)
    return (
      <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-tighter">
        Učitavanje...
      </div>
    );

  const jeVlasnik =
    korisnik?.uloga === "Vlasnik" &&
    Number(korisnik.id) === Number(data.idKorisnika);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <FacilityHeader
          name={data.naziv}
          sports={data.sportovi}
          isAuthenticated={Boolean(korisnik)}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />

        {/* Glavni grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 mb-12">
          <div className="space-y-8 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <FacilityInfo
              slikaUrl={data.slikaUrl || ""}
              adresa={data.adresa}
              kvart={data.kvart}
              kapacitet={data.kapacitet}
              klub={data.nazivKluba}
              opis={data.opis}
              lat={data.lat}
              lng={data.lng}
              naziv={data.naziv}
              sportovi={data.sportovi}
            />
          </div>
          
          <FacilitySchedule
            slots={data.termini ?? []}
            currentUserId={korisnik ? Number(korisnik.id) : null}
            isAuthenticated={Boolean(korisnik)}
            isOwner={jeVlasnik}
            onAddSlot={() => setIsTerminObrazacOpen(true)}
            onRefresh={refetch}
          />
  
          <FacilityReviews
            rating={data.ocjena}
            reviewCount={data.brojRecenzija}
            reviews={data.recenzije ?? []}
            isAuthenticated={Boolean(korisnik)}
            onAddReview={() => setIsObrazacOpen(true)}
          />
        </div>
      </main>

      <ReviewForm
        isOpen={isObrazacOpen}
        onClose={() => setIsObrazacOpen(false)}
        onSubmit={handleRecenzijaSubmit}
        objektNaziv={data.naziv}
      />
      <NewSlotsForm
        isOpen={isTerminObrazacOpen}
        onClose={() => setIsTerminObrazacOpen(false)}
        onSubmit={handleTerminSubmit}
        objektNaziv={data.naziv}
      />
    </div>
  );
}
