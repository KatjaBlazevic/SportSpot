import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

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
}

const SVE_SPORTOVI = ["Nogomet","Mali nogomet","Košarka","Tenis","Padel","Odbojka","Vaterpolo","Plivanje"];
const PERIODI = [
  { label: "Jutro (06:00 - 12:00)", value: "jutro" },
  { label: "Poslijepodne (12:00 - 18:00)", value: "poslijepodne" },
  { label: "Večer (18:00 - 24:00)", value: "vecer" },
];

function SportIcon({ sport }: { sport: string }) {
  const icons: Record<string, string> = {
    Tenis: "🎾", Padel: "🏓", Nogomet: "⚽", "Mali nogomet": "⚽",
    Košarka: "🏀", Odbojka: "🏐", Plivanje: "🏊", Vaterpolo: "🤽", Boćanje: "🎳",
  };
  return <span style={{ fontSize: 13 }}>{icons[sport] ?? "🏃"}</span>;
}

function ObjektKartica({ objekt }: { objekt: Objekt }) {
  const [prosiren, setProsiren] = useState(false);
  const slobodniTermini = objekt.termini.filter((t) => t.status === "Slobodan");

  return (
    <div
      style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EEFF", marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(37,99,235,0.06)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(37,99,235,0.13)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(37,99,235,0.06)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", gap: 16, padding: 16 }}>
        <div style={{ width: 110, height: 90, borderRadius: 12, background: "linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
          {objekt.sportovi[0] ? <SportIcon sport={objekt.sportovi[0]} /> : "🏟️"}
        </div>
        <div style={{ flex: 1 }}>
          <Link to={`/objekt/${objekt.id}`} style={{ textDecoration: "none" }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1D4ED8", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              {objekt.naziv}
            </h3>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "#6B7280", fontSize: 13 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {objekt.kvart}, Rijeka
            {objekt.ocjena && (
              <>
                <span style={{ marginLeft: 6 }}>⭐ {objekt.ocjena}</span>
                <span style={{ color: "#9CA3AF" }}>({objekt.brojRecenzija} recenzija)</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {objekt.sportovi.map((s) => (
              <span key={s} style={{ padding: "3px 10px", borderRadius: 999, background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <SportIcon sport={s} /> {s}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Već od</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
            {objekt.cijenaOd === 0 ? (
              <span style={{ color: "#16A34A", fontSize: 18 }}>Besplatno</span>
            ) : (
              <>{objekt.cijenaOd}€<span style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>/h</span></>
            )}
          </div>
        </div>
      </div>

      {slobodniTermini.length > 0 && (
        <div style={{ borderTop: "1px solid #F3F4F6" }}>
          <button
            onClick={() => setProsiren(!prosiren)}
            style={{ width: "100%", padding: "10px 16px", background: "#FAFBFF", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", letterSpacing: "0.3px", textTransform: "uppercase", fontFamily: "inherit" }}
          >
            <span>Dostupni termini ({slobodniTermini.length})</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: prosiren ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {prosiren && (
            <div style={{ padding: "0 16px 12px" }}>
              {slobodniTermini.map((termin) => (
                <div key={termin.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#F8FAFF", border: "1px solid #E8EEFF", marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <SportIcon sport={objekt.sportovi[0]} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                        {termin.datum && (
                          <span style={{ color: "#6B7280", fontWeight: 400 }}>
                            {new Date(termin.datum).toLocaleDateString("hr-HR")} · {" "}
                          </span>
                        )}
                        {termin.vrijemePocetka} – {termin.vrijemeKraja}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>
                        {termin.cijena === 0 ? (
                          <span style={{ color: "#16A34A", fontWeight: 600 }}>Besplatno</span>
                        ) : (
                          <span style={{ color: "#1D4ED8", fontWeight: 600 }}>{termin.cijena}€</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    style={{ padding: "8px 18px", borderRadius: 999, background: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(234,88,12,0.3)", transition: "opacity 0.2s, transform 0.1s", fontFamily: "inherit" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  >
                    REZERVIRAJ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {slobodniTermini.length === 0 && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "10px 16px" }}>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>Trenutno nema slobodnih termina</span>
        </div>
      )}
    </div>
  );
}

function MapaPlaceholder({ objekti }: { objekti: Objekt[] }) {
  const pinPoints = objekti.slice(0, 4).map((obj, i) => ({
    x: [52, 68, 44, 35][i] ?? 50,
    y: [38, 58, 62, 48][i] ?? 50,
    objekt: obj,
  }));
  return (
    <div style={{ position: "sticky", top: 80, height: "calc(100vh - 96px)", borderRadius: 20, overflow: "hidden", background: "#1E293B", border: "1.5px solid #334155", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
      <svg width="100%" height="100%" viewBox="0 0 400 600" style={{ position: "absolute", inset: 0 }}>
        <rect width="400" height="600" fill="#1E293B" />
        {[80, 140, 200, 260, 320, 380, 440, 490].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#334155" strokeWidth="1.5" />
        ))}
        {[60, 120, 180, 240, 300, 360].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="600" stroke="#334155" strokeWidth="1.5" />
        ))}
        <line x1="0" y1="0" x2="400" y2="300" stroke="#2D3E55" strokeWidth="1" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="#2D3E55" strokeWidth="1" />
        <rect x="80" y="160" width="60" height="40" rx="4" fill="#1A3A2A" opacity="0.8" />
        <rect x="260" y="300" width="80" height="60" rx="4" fill="#1A3A2A" opacity="0.8" />
        <path d="M0 520 Q100 500 200 515 Q300 530 400 510 L400 600 L0 600 Z" fill="#0F2744" opacity="0.9" />
      </svg>
      {pinPoints.map(({ x, y, objekt }, i) => (
        <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", cursor: "pointer", zIndex: 10 }}>
          <div style={{ background: "#1D4ED8", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: "0 3px 12px rgba(29,78,216,0.5)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, border: "2px solid rgba(255,255,255,0.2)" }}>
            <SportIcon sport={objekt?.sportovi[0] ?? "Nogomet"} />
            {objekt?.cijenaOd === 0 ? "Bespl." : `${objekt?.cijenaOd}€`}
          </div>
          <div style={{ width: 8, height: 8, background: "#3B82F6", borderRadius: "50%", margin: "4px auto 0", boxShadow: "0 0 0 3px rgba(59,130,246,0.3)" }} />
        </div>
      ))}
      {objekti[0] && (
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: "linear-gradient(135deg, #DBEAFE, #EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            <SportIcon sport={objekti[0].sportovi[0] ?? "Nogomet"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{objekti[0].naziv}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{objekti[0].kvart}, Rijeka</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>
                {objekti[0].cijenaOd === 0 ? "Besplatno" : `${objekti[0].cijenaOd}€/h`}
              </span>
              {objekti[0].termini.length > 0 && (
                <span style={{ fontSize: 12, color: "#EA580C", fontWeight: 600 }}>⚡ Brza rezervacija</span>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", color: "#94A3B8", fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 500 }}>
        Google karta (uskoro)
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
      setGreska("Nije moguće dohvatiti objekte. Provjeri je li backend pokrenut na portu 5000.");
      console.error(err);
    } finally {
      setUcitavanje(false);
    }
  }, [odabraniSportovi, odabraniKvart, odabraniDatum, odabraniPeriod, cijenaMin, cijenaMax, samoBesplatni]);

  useEffect(() => {
    (async () => {
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
        setGreska("Nije moguće dohvatiti objekte. Provjeri je li backend pokrenut na portu 5000.");
        console.error(err);
      } finally {
        setUcitavanje(false);
      }
    })();
  }, [odabraniSportovi, odabraniKvart, odabraniDatum, odabraniPeriod, cijenaMin, cijenaMax, samoBesplatni]);

  const filtriraniObjekti = searchQuery
    ? objekti.filter((o) => o.naziv.toLowerCase().includes(searchQuery.toLowerCase()) || o.kvart.toLowerCase().includes(searchQuery.toLowerCase()))
    : objekti;

  const toggleSport = (sport: string) =>
    setOdabraniSportovi((prev) => prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "220px 1fr 380px", gap: 20, alignItems: "start" }}>
      <aside style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EEFF", padding: 20, position: "sticky", top: 80, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Filteri</h2>
          <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Prilagodite pretragu</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Sportovi</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SVE_SPORTOVI.map((sport) => {
              const aktivan = odabraniSportovi.includes(sport);
              return (
                <button key={sport} onClick={() => toggleSport(sport)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: "none", background: aktivan ? "#1D4ED8" : "transparent", color: aktivan ? "#fff" : "#374151", fontWeight: aktivan ? 600 : 400, fontSize: 14, cursor: "pointer", textAlign: "left", transition: "background 0.15s", fontFamily: "inherit" }}>
                  <SportIcon sport={sport} /> {sport}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Termini</div>
          <input type="date" value={odabraniDatum} onChange={(e) => setOdabraniDatum(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151", fontFamily: "inherit", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
          <select value={odabraniPeriod} onChange={(e) => setOdabraniPeriod(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151", fontFamily: "inherit", background: "#fff", outline: "none", cursor: "pointer" }}>
            <option value="">Odaberi period</option>
            {PERIODI.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Lokacija</div>
          <select value={odabraniKvart} onChange={(e) => setOdabraniKvart(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151", fontFamily: "inherit", background: "#fff", outline: "none", cursor: "pointer" }}>
            {sviKvartovi.map((k) => <option key={k} value={k}>{k === "Svi kvartovi" ? "Rijeka - Svi kvartovi" : k}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Cijena (€/h)</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={samoBesplatni}
              onChange={(e) => { setSamoBesplatni(e.target.checked); if (e.target.checked) { setCijenaMin(""); setCijenaMax(""); } }}
              style={{ width: 15, height: 15, accentColor: "#1D4ED8", cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Prikaži samo besplatne</span>
          </label>
          {!samoBesplatni && (
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" min={0} placeholder="Od (€)" value={cijenaMin} onChange={(e) => setCijenaMin(e.target.value)}
                style={{ width: "50%", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              <input type="number" min={0} placeholder="Do (€)" value={cijenaMax} onChange={(e) => setCijenaMax(e.target.value)}
                style={{ width: "50%", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, color: "#374151", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
          )}
        </div>

        <button onClick={dohvatiObjekte}
          style={{ width: "100%", padding: "11px", borderRadius: 999, background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 2px 10px rgba(29,78,216,0.3)", fontFamily: "inherit" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}>
          Primijeni filtere
        </button>

        {(odabraniSportovi.length > 0 || odabraniKvart !== "Svi kvartovi" || odabraniDatum || odabraniPeriod || cijenaMin || cijenaMax || samoBesplatni) && (
          <button
            onClick={() => { setOdabraniSportovi([]); setOdabraniKvart("Svi kvartovi"); setOdabraniDatum(""); setOdabraniPeriod(""); setCijenaMin(""); setCijenaMax(""); setSamoBesplatni(false); }}
            style={{ width: "100%", padding: "9px", borderRadius: 999, background: "transparent", color: "#6B7280", fontWeight: 500, fontSize: 13, border: "1px solid #E5E7EB", cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
            Poništi filtere
          </button>
        )}
      </aside>

      <main>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 800, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
            {ucitavanje ? "Učitavanje..." : `Pronađeno: ${filtriraniObjekti.length} terena`}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#9CA3AF" }}>
            Rezultati za: Rijeka, Hrvatska{searchQuery && ` · "${searchQuery}"`}
          </p>
        </div>

        {greska && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 16px", marginBottom: 16, color: "#DC2626", fontSize: 14 }}>
            ⚠️ {greska}
          </div>
        )}

        {ucitavanje ? (
          [1, 2, 3].map((i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E8EEFF", height: 130, marginBottom: 16, opacity: 0.5 }} />
          ))
        ) : filtriraniObjekti.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1.5px solid #E8EEFF" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ color: "#374151", margin: "0 0 6px" }}>Nema rezultata</h3>
            <p style={{ color: "#9CA3AF", margin: 0 }}>Pokušajte s drugačijim filterima</p>
          </div>
        ) : (
          filtriraniObjekti.map((obj) => <ObjektKartica key={obj.id} objekt={obj} />)
        )}
      </main>

      <aside>
        <MapaPlaceholder objekti={filtriraniObjekti} />
      </aside>
    </div>
  );
}