import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

const API_URL = `http://localhost:5000/api`;

interface Termin {
  id: number;
  datum?: string;
  vrijemePocetka: string;
  vrijemeKraja: string;
  cijena: number;
  status: "Slobodan" | "Zauzet";
}

interface Objekt {
  id: number;
  naziv: string;
  adresa: string;
  kvart: string;
  sportovi: string[];
  ocjena: number | null;
  brojRecenzija: number;
  cijenaOd: number;
  termini: Termin[];
  lat: number | null;
  lng: number | null;
  slikaUrl: string | null;
}

const SVE_SPORTOVI = [
  "Nogomet",
  "Mali nogomet",
  "Košarka",
  "Tenis",
  "Padel",
  "Odbojka",
  "Vaterpolo",
  "Boćanje",
  "Stolni tenis",
  "Plivanje",
];
const PERIODI = [
  { label: "Jutro (06:00 - 12:00)", value: "jutro" },
  { label: "Poslijepodne (12:00 - 18:00)", value: "poslijepodne" },
  { label: "Večer (18:00 - 24:00)", value: "vecer" },
];

function SportIcon({ sport }: { sport: string }) {
  const icons: Record<string, string> = {
    Tenis: "🎾",
    Padel: "🏓",
    Nogomet: "⚽",
    "Mali nogomet": "⚽",
    Košarka: "🏀",
    Odbojka: "🏐",
    Plivanje: "🏊",
    Vaterpolo: "🤽",
    Boćanje: "🎳",
    "Stolni tenis": "🏓",
  };
  return <span style={{ fontSize: 13 }}>{icons[sport] ?? "🏃"}</span>;
}

function ObjektKartica({ objekt }: { objekt: Objekt }) {
  const slobodniTermini = objekt.termini.filter((t) => t.status === "Slobodan");

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1.5px solid #E8EEFF",
        marginBottom: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 6px 24px rgba(37,99,235,0.13)";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(37,99,235,0.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", gap: 16, padding: 16 }}>
        <div
          style={{
            width: 110,
            height: 90,
            borderRadius: 12,
            flexShrink: 0,
            overflow: "hidden",
            background: "linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}
        >
          {objekt.slikaUrl ? (
            <img
              src={objekt.slikaUrl}
              alt={objekt.naziv}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : objekt.sportovi[0] ? (
            <SportIcon sport={objekt.sportovi[0]} />
          ) : (
            <span>🏟️</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <Link to={`/objekt/${objekt.id}`} style={{ textDecoration: "none" }}>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#1D4ED8",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              {objekt.naziv}
            </h3>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              color: "#6B7280",
              fontSize: 13,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {objekt.kvart}, Rijeka
            {objekt.ocjena && (
              <>
                <span style={{ marginLeft: 6 }}>⭐ {objekt.ocjena}</span>
                <span style={{ color: "#9CA3AF" }}>
                  ({objekt.brojRecenzija} recenzija)
                </span>
              </>
            )}
          </div>
          <div
            style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}
          >
            {objekt.sportovi.map((s) => (
              <span
                key={s}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <SportIcon sport={s} /> {s}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Već od
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#111827",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {objekt.cijenaOd === 0 ? (
              <span style={{ color: "#16A34A", fontSize: 18 }}>Besplatno</span>
            ) : (
              <>
                {objekt.cijenaOd}€
                <span
                  style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}
                >
                  /h
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid #F3F4F6",
          padding: "10px 16px",
          background: slobodniTermini.length > 0 ? "#F0FDF4" : "#FAFBFF",
        }}
      >
        {slobodniTermini.length > 0 ? (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: "#16A34A",
                borderRadius: "50%",
                boxShadow: "0 0 8px rgba(22,163,74,0.4)",
              }}
            ></span>
            Dostupno slobodnih termina: {slobodniTermini.length}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
            Trenutno nema slobodnih termina
          </span>
        )}
      </div>
    </div>
  );
}

// ─── MapaLeaflet ──────────────────────────────────────────────────────────────
function MapaPlaceholder({ objekti }: { objekti: Objekt[] }) {
  const mapaRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const leafletMapRef = useRef<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapaRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapaRef.current, {
        center: [45.3271, 14.4422],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, subdomains: "abcd" },
      ).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (objekti.length === 0) return;

    const sportIkone: Record<string, string> = {
      Tenis: "🎾",
      Padel: "🏓",
      Nogomet: "⚽",
      "Mali nogomet": "⚽",
      Košarka: "🏀",
      Odbojka: "🏐",
      Plivanje: "🏊",
      Vaterpolo: "🤽",
    };

    // Zamijeni cijeli dodajMarkere() async blok s ovim:
    const dodajMarkere = () => {
      const bounds: [number, number][] = [];

      for (const obj of objekti) {
        if (!obj.lat || !obj.lng) continue;

        const koord: [number, number] = [obj.lat, obj.lng];
        const ikona = sportIkone[obj.sportovi[0]] ?? "🏟️";
        const cijena = obj.cijenaOd === 0 ? "Besplatno" : `${obj.cijenaOd}€/h`;

        const customIcon = L.divIcon({
          className: "",
          html: `
        <div style="
          background: #1D4ED8; border: 2.5px solid #60A5FA;
          border-radius: 50% 50% 50% 0; width: 36px; height: 36px;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(29,78,216,0.5); cursor: pointer;
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">${ikona}</span>
        </div>
      `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker(koord, { icon: customIcon }).addTo(map);
        marker.bindPopup(`
      <div style="font-family: 'DM Sans', sans-serif; min-width: 180px; padding: 4px 2px;">
        <div style="font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 4px;">${obj.naziv}</div>
        <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">📍 ${obj.adresa}, ${obj.kvart}</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="background: #EFF6FF; color: #1D4ED8; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;">${obj.sportovi[0] ?? "Sport"}</span>
          <span style="font-weight: 700; color: #1D4ED8; font-size: 13px;">${cijena}</span>
        </div>
        ${obj.ocjena ? `<div style="font-size: 12px; color: #6B7280; margin-top: 4px;">⭐ ${obj.ocjena} (${obj.brojRecenzija} recenzija)</div>` : ""}
      </div>
    `);

        markersRef.current.push(marker);
        bounds.push(koord);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    };

    dodajMarkere();
  }, [objekti]);

  return (
    <div
      style={{
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
        border: "1.5px solid #334155",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
    >
      <div ref={mapaRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(15,23,42,0.85)",
          color: "#94A3B8",
          fontSize: 11,
          padding: "4px 10px",
          borderRadius: 999,
          fontWeight: 500,
          zIndex: 1000,
          backdropFilter: "blur(6px)",
        }}
      >
        📍 {objekti.length} objekata
      </div>
    </div>
  );
}

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

  useEffect(() => {
    fetch(`${API_URL}/objekti/kvartovi`)
      .then((r) => r.json())
      .then((data) => setSviKvartovi(["Svi kvartovi", ...data]))
      .catch(() => setSviKvartovi(["Svi kvartovi"]));
  }, []);

  const dohvatiObjekte = useCallback(async () => {
    setUcitavanje(true);
    setGreska(null);
    try {
      const params = new URLSearchParams();
      odabraniSportovi.forEach((sport) => params.append("sport", sport));
      if (odabraniKvart !== "Svi kvartovi") params.set("kvart", odabraniKvart);
      if (odabraniDatum) params.set("datum", odabraniDatum);
      if (odabraniPeriod) params.set("period", odabraniPeriod);
      if (samoBesplatni) params.set("besplatni", "true");
      if (!samoBesplatni && cijenaMin) params.set("cijenaMin", cijenaMin);
      if (!samoBesplatni && cijenaMax) params.set("cijenaMax", cijenaMax);

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
  ]);

  useEffect(() => {
    (async () => {
      setUcitavanje(true);
      setGreska(null);
      try {
        const params = new URLSearchParams();
        odabraniSportovi.forEach((sport) => params.append("sport", sport));
        if (odabraniKvart !== "Svi kvartovi")
          params.set("kvart", odabraniKvart);
        if (odabraniDatum) params.set("datum", odabraniDatum);
        if (odabraniPeriod) params.set("period", odabraniPeriod);
        if (samoBesplatni) params.set("besplatni", "true");
        if (!samoBesplatni && cijenaMin) params.set("cijenaMin", cijenaMin);
        if (!samoBesplatni && cijenaMax) params.set("cijenaMax", cijenaMax);

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

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "20px 24px",
        display: "grid",
        gridTemplateColumns: "260px 1fr 380px",
        gap: 20,
        alignItems: "start",
      }}
    >
      <aside
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1.5px solid #E8EEFF",
          padding: "16px 14px",
          position: "sticky",
          top: 80,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
          scrollbarWidth: "thin",
          scrollbarColor: "#BFDBFE transparent",
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <h2
            style={{
              margin: "0 0 2px",
              fontSize: 15,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Filteri
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>
            Prilagodite pretragu
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Sportovi
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}
          >
            {SVE_SPORTOVI.map((sport) => {
              const aktivan = odabraniSportovi.includes(sport);
              return (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 7px",
                    borderRadius: 7,
                    border: `1.5px solid ${aktivan ? "#1D4ED8" : "#E5E7EB"}`,
                    background: aktivan ? "#EFF6FF" : "transparent",
                    color: aktivan ? "#1D4ED8" : "#374151",
                    fontWeight: aktivan ? 700 : 400,
                    fontSize: 11,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <SportIcon sport={sport} /> {sport}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Termini
          </div>
          <input
            type="date"
            value={odabraniDatum}
            onChange={(e) => setOdabraniDatum(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 8,
              border: "1.5px solid #E5E7EB",
              fontSize: 12,
              color: "#374151",
              fontFamily: "inherit",
              marginBottom: 6,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <select
            value={odabraniPeriod}
            onChange={(e) => setOdabraniPeriod(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 8,
              border: "1.5px solid #E5E7EB",
              fontSize: 12,
              color: "#374151",
              fontFamily: "inherit",
              background: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Odaberi period</option>
            {PERIODI.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Lokacija
          </div>
          <select
            value={odabraniKvart}
            onChange={(e) => setOdabraniKvart(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 8,
              border: "1.5px solid #E5E7EB",
              fontSize: 12,
              color: "#374151",
              fontFamily: "inherit",
              background: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {sviKvartovi.map((k) => (
              <option key={k} value={k}>
                {k === "Svi kvartovi" ? "Rijeka - Svi kvartovi" : k}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Cijena (€/h)
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={samoBesplatni}
              onChange={(e) => {
                setSamoBesplatni(e.target.checked);
                if (e.target.checked) {
                  setCijenaMin("");
                  setCijenaMax("");
                }
              }}
              style={{
                width: 14,
                height: 14,
                accentColor: "#1D4ED8",
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>
              Samo besplatni
            </span>
          </label>
          {!samoBesplatni && (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="number"
                min={0}
                placeholder="Od (€)"
                value={cijenaMin}
                onChange={(e) => setCijenaMin(e.target.value)}
                style={{
                  width: "50%",
                  padding: "7px 8px",
                  borderRadius: 8,
                  border: "1.5px solid #E5E7EB",
                  fontSize: 12,
                  color: "#374151",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="number"
                min={0}
                placeholder="Do (€)"
                value={cijenaMax}
                onChange={(e) => setCijenaMax(e.target.value)}
                style={{
                  width: "50%",
                  padding: "7px 8px",
                  borderRadius: 8,
                  border: "1.5px solid #E5E7EB",
                  fontSize: 12,
                  color: "#374151",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={dohvatiObjekte}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(29,78,216,0.3)",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
          }
        >
          Primijeni filtere
        </button>

        {(odabraniSportovi.length > 0 ||
          odabraniKvart !== "Svi kvartovi" ||
          odabraniDatum ||
          odabraniPeriod ||
          cijenaMin ||
          cijenaMax ||
          samoBesplatni) && (
          <button
            onClick={() => {
              setOdabraniSportovi([]);
              setOdabraniKvart("Svi kvartovi");
              setOdabraniDatum("");
              setOdabraniPeriod("");
              setCijenaMin("");
              setCijenaMax("");
              setSamoBesplatni(false);
            }}
            style={{
              width: "100%",
              padding: "7px",
              borderRadius: 999,
              background: "transparent",
              color: "#6B7280",
              fontWeight: 500,
              fontSize: 12,
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              marginTop: 6,
              fontFamily: "inherit",
            }}
          >
            Poništi filtere
          </button>
        )}
      </aside>

      <main>
        <div style={{ marginBottom: 16 }}>
          <h1
            style={{
              margin: "0 0 2px",
              fontSize: 24,
              fontWeight: 800,
              color: "#111827",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {ucitavanje
              ? "Učitavanje..."
              : `Pronađeno: ${filtriraniObjekti.length} terena`}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#9CA3AF" }}>
            Rezultati za: Rijeka, Hrvatska{searchQuery && ` · "${searchQuery}"`}
          </p>
        </div>

        {greska && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 16,
              color: "#DC2626",
              fontSize: 14,
            }}
          >
            ⚠️ {greska}
          </div>
        )}

        {ucitavanje ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1.5px solid #E8EEFF",
                height: 130,
                marginBottom: 16,
                opacity: 0.5,
              }}
            />
          ))
        ) : filtriraniObjekti.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #E8EEFF",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ color: "#374151", margin: "0 0 6px" }}>
              Nema rezultata
            </h3>
            <p style={{ color: "#9CA3AF", margin: 0 }}>
              Pokušajte s drugačijim filterima
            </p>
          </div>
        ) : (
          filtriraniObjekti.map((obj) => (
            <ObjektKartica key={obj.id} objekt={obj} />
          ))
        )}
      </main>

      <aside
        style={{ position: "sticky", top: 80, height: "calc(100vh - 96px)" }}
      >
        <MapaPlaceholder objekti={filtriraniObjekti} />
      </aside>
    </div>
  );
}