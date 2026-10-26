import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import HomeFilters from "../components/Home/HomeFilters";
import HomeResultsHeader from "../components/Home/HomeResultsHeader";
import HomeResultsState from "../components/Home/HomeResultsState";
import HomeMap from "../components/Home/HomeMap";
import ObjectCard from "../components/ObjectCard";
import Pagination from "../components/Pagination";
import useHomeFilters from "../hooks/useHomeFilters";
import useFacilities from "../hooks/useFacilities";

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  const {
    selectedSports: odabraniSportovi,
    setSelectedSports: setOdabraniSportovi,
    selectedDistrict: odabraniKvart,
    setSelectedDistrict: setOdabraniKvart,
    selectedDate: odabraniDatum,
    setSelectedDate: setOdabraniDatum,
    selectedPeriod: odabraniPeriod,
    setSelectedPeriod: setOdabraniPeriod,
    minPrice: cijenaMin,
    setMinPrice: setCijenaMin,
    maxPrice: cijenaMax,
    setMaxPrice: setCijenaMax,
    freeOnly: samoBesplatni,
    setFreeOnly: setSamoBesplatni,
    districts: sviKvartovi,
    toggleSport,
    hasActiveFilters: aktivniFilteri,
  } = useHomeFilters();

  const {
    facilities: objekti,
    isLoading: ucitavanje,
    error: greska,
    refetch: dohvatiObjekte,
  } = useFacilities({
    selectedSports: odabraniSportovi,
    selectedDistrict: odabraniKvart,
    selectedDate: odabraniDatum,
    selectedPeriod: odabraniPeriod,
    minPrice: cijenaMin,
    maxPrice: cijenaMax,
    freeOnly: samoBesplatni,
  });

  const [filterOtvoren, setFilterOtvoren] = useState(false);
  const [trenutnaStr, setTrenutnaStr] = useState(1);
  const PO_STRANICI = 6;
  const [mapaOtvorena, setMapaOtvorena] = useState(false);

  const filtriraniObjekti = searchQuery
    ? objekti.filter(
        (o) =>
          o.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.kvart.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : objekti;

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
          className="fixed inset-0 z-1 bg-black/40"
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
            type="button"
            onClick={() => setFilterOtvoren(!filterOtvoren)}
            className={`flex cursor-pointer items-center gap-2 rounded-full border border-primary px-[18px] py-2.5 text-sm font-bold shadow-sport-sm transition-colors ${
              filterOtvoren
                ? "bg-primary text-text-inverse"
                : "bg-surface text-primary"
            }`}
          >
            <span>🔍 Filtri</span>

            {aktivniFilteri && (
              <span className="flex size-[18px] items-center justify-center rounded-full bg-danger text-[11px] font-extrabold text-text-inverse">
                !
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMapaOtvorena(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-border-default bg-surface px-[18px] py-2.5 text-sm font-semibold text-text-primary shadow-sport-sm transition-colors hover:bg-surface-soft"
          >
            <span>🗺️ Karta</span>
          </button>
        </div>

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
            setTrenutnaStr(1);
            void dohvatiObjekte();
            setFilterOtvoren(false);
          }}
        />

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

        <aside className="home-mapa-aside sticky top-20 h-[calc(100vh-96px)]">
          <HomeMap facilities={filtriraniObjekti} />
        </aside>
      </div>
    </>
  );
}
