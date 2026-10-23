import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import HomeFilters from "../components/Home/HomeFilters";
import HomeResultsHeader from "../components/Home/HomeResultsHeader";
import HomeResultsState from "../components/Home/HomeResultsState";
import HomeMap from "../components/Home/HomeMap";
import ObjectCard from "../components/ObjectCard";
import Pagination from "../components/Pagination";
import type { SportsFacility } from "../types/sportsFacility";
import { buildFacilityQuery } from "../utils/buildFacilityQuery";

const API_URL = `http://localhost:5000/api`;

type Objekt = SportsFacility;


export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  const [objekti, setObjekti] = useState<Objekt[]>([]);
  const [ucitavanje, setUcitavanje] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);

  const [odabraniSportovi, setOdabraniSportovi] = useState<string[]>([]);
  const [odabraniKvart, setOdabraniKvart] = useState("Svi kvartovi");
  const [odabraniDatum, setOdabraniDatum] = useState("");
  const [odabraniPeriod, setOdabraniPeriod] = useState("");
  const [cijenaMin, setCijenaMin] = useState("");
  const [cijenaMax, setCijenaMax] = useState("");
  const [samoBesplatni, setSamoBesplatni] = useState(false);
  const [sviKvartovi, setSviKvartovi] = useState<string[]>(["Svi kvartovi"]);
  const [filterOtvoren, setFilterOtvoren] = useState(false);
  const [trenutnaStr, setTrenutnaStr] = useState(1);
  const PO_STRANICI = 6;
  const [mapaOtvorena, setMapaOtvorena] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/objekti/kvartovi`)
      .then((r) => r.json())
      .then((data) => setSviKvartovi(["Svi kvartovi", ...data]))
      .catch(() => setSviKvartovi(["Svi kvartovi"]));
  }, []);

  
  // TODO: Refaktorirati dohvaćanje objekata.
  // Trenutno se objekti dohvaćaju automatski kroz useEffect,
  // ali i ručno pozivom dohvatiObjekte() na gumb "Primijeni filtere".
  // Potrebno je odlučiti hoće li se filteri primjenjivati
  // automatski ili tek nakon klika, kako bi se izbjegli
  // duplicirani API zahtjevi.

  const dohvatiObjekte = useCallback(async () => {
    setUcitavanje(true);
    setGreska(null);
    try {
      setTrenutnaStr(1);
      const params = buildFacilityQuery({
        selectedSports: odabraniSportovi,
        selectedDistrict: odabraniKvart,
        selectedDate: odabraniDatum,
        selectedPeriod: odabraniPeriod,
        minPrice: cijenaMin,
        maxPrice: cijenaMax,
        freeOnly: samoBesplatni,
      });

      const res = await fetch(`${API_URL}/objekti?${params.toString()}`);
      if (!res.ok) throw new Error("Greška pri dohvaćanju podataka");
      const data = await res.json();
      setObjekti(data);
    } catch (err) {
      setGreska(
        "Nije moguće dohvatiti objekte. Provjeri je li backend pokrenut na portu 5000.",
      );
      console.error(err);
    } finally {
      setUcitavanje(false);
    }
  }, [
    odabraniSportovi,
    odabraniKvart,
    odabraniDatum,
    odabraniPeriod,
    cijenaMin,
    cijenaMax,
    samoBesplatni,
    setTrenutnaStr,
  ]);

  useEffect(() => {
    (async () => {
      setUcitavanje(true);
      setGreska(null);
      try {
        const params = buildFacilityQuery({
          selectedSports: odabraniSportovi,
          selectedDistrict: odabraniKvart,
          selectedDate: odabraniDatum,
          selectedPeriod: odabraniPeriod,
          minPrice: cijenaMin,
          maxPrice: cijenaMax,
          freeOnly: samoBesplatni,
        });

        const res = await fetch(`${API_URL}/objekti?${params.toString()}`);
        if (!res.ok) throw new Error("Greška pri dohvaćanju podataka");
        const data = await res.json();
        setObjekti(data);
      } catch (err) {
        setGreska(
          "Nije moguće dohvatiti objekte. Provjeri je li backend pokrenut na portu 5000.",
        );
        console.error(err);
      } finally {
        setUcitavanje(false);
      }
    })();
  }, [
    odabraniSportovi,
    odabraniKvart,
    odabraniDatum,
    odabraniPeriod,
    cijenaMin,
    cijenaMax,
    samoBesplatni,
  ]);

  const filtriraniObjekti = searchQuery
    ? objekti.filter(
        (o) =>
          o.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.kvart.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : objekti;

  const toggleSport = (sport: string) =>
    setOdabraniSportovi((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );

  const aktivniFilteri =
    odabraniSportovi.length > 0 ||
    odabraniKvart !== "Svi kvartovi" ||
    !!odabraniDatum ||
    !!cijenaMin ||
    !!cijenaMax ||
    samoBesplatni;

  const ukupnoStranica = Math.ceil(filtriraniObjekti.length / PO_STRANICI);
  const vidljiviObjekti = filtriraniObjekti.slice(
    (trenutnaStr - 1) * PO_STRANICI,
    trenutnaStr * PO_STRANICI,
  );

  return (
    <>
      {/* OVERLAY za filter na mobitelu */}
      {filterOtvoren && (
        <div
          onClick={() => setFilterOtvoren(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1,
          }}
        />
      )}

      {/* MAPA MODAL na mobitelu */}
      {mapaOtvorena && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "#0f172a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#fff",
              borderBottom: "1px solid #E8EEFF",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
              📍 Mapa objekata
            </span>
            <button
              onClick={() => setMapaOtvorena(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: "#374151",
                lineHeight: 1,
              }}
            >
              <span>{"✕"}</span>
            </button>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <HomeMap facilities={filtriraniObjekti} />
          </div>
        </div>
      )}

      <div className="home-grid">
        {/* MOBILNI akcijski gumbi */}
        <div className="mob-akcijski-gumbi">
          <button
            onClick={() => setFilterOtvoren(!filterOtvoren)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              background: filterOtvoren ? "#1D4ED8" : "#fff",
              color: filterOtvoren ? "#fff" : "#1D4ED8",
              border: "1.5px solid #1D4ED8",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(29,78,216,0.15)",
            }}
          >
            <span>{"🔍 Filtri"}</span>
            {aktivniFilteri && (
              <span
                style={{
                  background: "#EF4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>{"!"}</span>
              </span>
            )}
          </button>
          <button
            onClick={() => setMapaOtvorena(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              background: "#fff",
              color: "#374151",
              border: "1.5px solid #E5E7EB",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <span>{"🗺️ Karta"}</span>
          </button>
        </div>
        
{/* FILTER ASIDE */}
<HomeFilters
  filterOtvoren={filterOtvoren}

  odabraniSportovi={odabraniSportovi}
  odabraniKvart={odabraniKvart}
  odabraniDatum={odabraniDatum}
  odabraniPeriod={odabraniPeriod}
  cijenaMin={cijenaMin}
  cijenaMax={cijenaMax}
  samoBesplatni={samoBesplatni}

  sviKvartovi={sviKvartovi}
  aktivniFilteri={aktivniFilteri}

  toggleSport={toggleSport}

  setOdabraniSportovi={setOdabraniSportovi}
  setOdabraniKvart={setOdabraniKvart}
  setOdabraniDatum={setOdabraniDatum}
  setOdabraniPeriod={setOdabraniPeriod}
  setCijenaMin={setCijenaMin}
  setCijenaMax={setCijenaMax}
  setSamoBesplatni={setSamoBesplatni}

  onApply={() => {
    dohvatiObjekte();
    setFilterOtvoren(false);
  }}
/>

        {/* MAIN - lista objekata */}
<main>
  <HomeResultsHeader
    ucitavanje={ucitavanje}
    brojRezultata={filtriraniObjekti.length}
    searchQuery={searchQuery}
    greska={greska}
  />

          
{ucitavanje ? (
  <HomeResultsState state="loading" />
) : filtriraniObjekti.length === 0 ? (
  <HomeResultsState state="empty" />
) : (

            <>
              {vidljiviObjekti.map((obj) => (
  <ObjectCard key={obj.id} facility={obj} />
))}
              
<Pagination
  currentPage={trenutnaStr}
  totalPages={ukupnoStranica}
  onPageChange={setTrenutnaStr}
/>

            </>
          )}
        </main>

        {/* MAPA - desni aside, skriven na mobitelu */}
       
<aside className="home-mapa-aside sticky top-20 h-[calc(100vh-96px)]">
  <HomeMap facilities={filtriraniObjekti} />
</aside>

      </div>
    </>
  );
}
