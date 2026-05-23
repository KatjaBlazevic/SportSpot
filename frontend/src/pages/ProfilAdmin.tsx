import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface DashboardPodaci {
  ukupnoKorisnika: number; ukupnoVlasnika: number; ukupnoObjekta: number;
  ukupnoPending: number; ukupnoKlubova: number; ukupnoRecenzija: number; ukupnoRezervacija: number;
}
interface DashboardExtra {
  topObjekti: { naziv: string; kvart: string; brojRezervacija: number; ocjena: number | null; }[];
  stats: { danas: number; ovajTjedan: number; ovajMjesec: number; prihodMjesec: number; };
}
interface AdminKorisnik { id: number; ime: string; prezime: string; email: string; brojMobitela: string | null; uloga: string; }
interface AdminObjekt { id: number; naziv: string; adresa: string; kvart: string; kapacitet: number | null; opis: string | null; slikaUrl: string | null; vlasnik: string; vlasnikId: number | null; sportovi: string; status_objekta: string; idKluba: number | null; nazivKluba: string | null; }
interface AdminKlub { id: number; naziv: string; oib: string; kontakt: string | null; objektiIds: number[]; objektiNazivi: string[]; }
interface AdminRecenzija { idKorisnika: number; idObjekta: number; ocjena: number; komentar: string | null; datum: string; ime: string; prezime: string; nazivObjekta: string; }
interface AdminTermin { id: number; datum: string; vrijemePocetka: string; vrijemeKraja: string; cijena: number; status: string; korisnik: string | null; }
interface Sport { ID_sporta: number; Naziv_sporta: string; }

type Tab = "dashboard" | "korisnici" | "objekti" | "klubovi" | "recenzije";

const API = "https://sportspot-sxcq.onrender.com/api/admin";

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 14, boxSizing: "border-box" as const };
const btnPrimary = { padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14 };
const btnSecondary = { padding: "8px 16px", borderRadius: 8, background: "#EEF2FF", color: "#1D4ED8", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const btnDanger = { padding: "8px 14px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const btnSuccess = { padding: "8px 14px", borderRadius: 8, background: "#D1FAE5", color: "#059669", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 };

  const Modal = ({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "90%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
  
export default function ProfilAdmin() {
  const { korisnik, token, ucitavanje } = useAuth();
  const navigate = useNavigate();
  const [aktivnaTab, setAktivnaTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<DashboardPodaci | null>(null);
  const [dashboardExtra, setDashboardExtra] = useState<DashboardExtra | null>(null);
  const [korisnici, setKorisnici] = useState<AdminKorisnik[]>([]);
  const [objekti, setObjekti] = useState<AdminObjekt[]>([]);
  const [klubovi, setKlubovi] = useState<AdminKlub[]>([]);
  const [recenzije, setRecenzije] = useState<AdminRecenzija[]>([]);
  const [sviSportovi, setSviSportovi] = useState<Sport[]>([]);
  const [sviVlasnici, setSviVlasnici] = useState<AdminKorisnik[]>([]);
  const [sviKvartovi, setSviKvartovi] = useState<string[]>([]);
  const [ucitava, setUcitava] = useState(false);
  const [poruka, setPoruka] = useState("");

  const [terminiObjektId, setTerminiObjektId] = useState<number | null>(null);
  const [terminiObjektNaziv, setTerminiObjektNaziv] = useState("");
  const [termini, setTermini] = useState<AdminTermin[]>([]);
  const [showTerminiModal, setShowTerminiModal] = useState(false);
  const [showDodajTermin, setShowDodajTermin] = useState(false);
  const [editTermin, setEditTermin] = useState<AdminTermin | null>(null);
  const [terminData, setTerminData] = useState({ datum: "", vrijemePocetka: "", vrijemeKraja: "", cijena: "", ponavljajDo: "", ponavljaj: false });

  const [showObjektModal, setShowObjektModal] = useState(false);
  const [objektMod, setObjektMod] = useState<"dodaj" | "uredi">("dodaj");
  const [editObjektId, setEditObjektId] = useState<number | null>(null);
  const [noviKvartAdmin, setNoviKvartAdmin] = useState(false);
  const [objektData, setObjektData] = useState({ naziv: "", adresa: "", kvart: "", kapacitet: "", opis: "", slikaUrl: "", vlasnikId: "", idKluba: "" });
  const [odabraniSportovi, setOdabraniSportovi] = useState<number[]>([]);

  const [showKorisnikModal, setShowKorisnikModal] = useState(false);
  const [noviKorisnik, setNoviKorisnik] = useState({ ime: "", prezime: "", email: "", lozinka: "", brojMobitela: "", uloga: "User" });

  const [showKlubModal, setShowKlubModal] = useState(false);
  const [klubMod, setKlubMod] = useState<"dodaj" | "uredi">("dodaj");
  const [editKlubId, setEditKlubId] = useState<number | null>(null);
  const [klubData, setKlubData] = useState({ naziv: "", oib: "", kontakt: "" });

  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const prikaziPoruku = (msg: string) => { setPoruka(msg); setTimeout(() => setPoruka(""), 3000); };

  useEffect(() => { if (!ucitavanje && !korisnik) navigate("/prijava"); }, [ucitavanje, korisnik, navigate]);

  useEffect(() => {
    if (!token) return;
    fetch("https://sportspot-sxcq.onrender.com/api/korisnik/sportovi", { headers }).then(r => r.json()).then(setSviSportovi).catch(() => {});
    fetch("https://sportspot-sxcq.onrender.com/api/objekti/kvartovi").then(r => r.json()).then(setSviKvartovi).catch(() => {});
  }, [token]);

  const ucitajObjekte = () => {
    return Promise.all([
      fetch(`${API}/objekti`, { headers }).then(r => r.json()),
      fetch(`${API}/korisnici`, { headers }).then(r => r.json())
    ]).then(([obj, kor]) => {
      setObjekti(obj);
      setSviVlasnici(kor.filter((k: AdminKorisnik) => k.uloga === "Vlasnik" || k.uloga === "Admin"));
    });
  };

  const ucitajKlubove = () => fetch(`${API}/klubovi`, { headers }).then(r => r.json()).then(setKlubovi);

  useEffect(() => {
    if (!token) return;

    if (aktivnaTab === "dashboard") {
      (async () => {
        setUcitava(true);
        try {
          const [dash, extra] = await Promise.all([
            fetch(`${API}/dashboard`, { headers }).then(r => r.json()),
            fetch(`${API}/dashboard/extra`, { headers }).then(r => r.json()),
          ]);
          setDashboard(dash);
          setDashboardExtra(extra);
        } finally {
          setUcitava(false);
        }
      })();
    }
    if (aktivnaTab === "korisnici") {
      (async () => {
        setUcitava(true);
        try {
          const data = await fetch(`${API}/korisnici`, { headers }).then(r => r.json());
          setKorisnici(data);
          setSviVlasnici(data.filter((k: AdminKorisnik) => k.uloga === "Vlasnik"));
        } finally {
          setUcitava(false);
        }
      })();
    }
    if (aktivnaTab === "objekti") {
      (async () => {
        setUcitava(true);
        try {
          const [obj, kor, klu] = await Promise.all([
            fetch(`${API}/objekti`, { headers }).then(r => r.json()),
            fetch(`${API}/korisnici`, { headers }).then(r => r.json()),
            fetch(`${API}/klubovi`, { headers }).then(r => r.json()),
          ]);
          setObjekti(obj);
          setSviVlasnici(kor.filter((k: AdminKorisnik) => k.uloga === "Vlasnik" || k.uloga === "Admin"));
          setKlubovi(klu);
        } finally {
          setUcitava(false);
        }
      })();
    }
    if (aktivnaTab === "klubovi") {
      (async () => {
        setUcitava(true);
        try {
          const [klu, obj] = await Promise.all([
            fetch(`${API}/klubovi`, { headers }).then(r => r.json()),
            fetch(`${API}/objekti`, { headers }).then(r => r.json()),
          ]);
          setKlubovi(klu);
          setObjekti(obj);
        } finally {
          setUcitava(false);
        }
      })();
    }
    if (aktivnaTab === "recenzije") {
      (async () => {
        setUcitava(true);
        try {
          const data = await fetch(`${API}/recenzije`, { headers }).then(r => r.json());
          setRecenzije(data);
        } finally {
          setUcitava(false);
        }
      })();
    }
  }, [aktivnaTab, token]);

  const ucitajTermine = (idObjekta: number, naziv: string) => {
    setTerminiObjektId(idObjekta); setTerminiObjektNaziv(naziv);
    fetch(`${API}/objekti/${idObjekta}/termini`, { headers }).then(r => r.json()).then(setTermini);
    setShowTerminiModal(true);
  };

  const spremiTermin = async () => {
    if (editTermin) {
      await fetch(`${API}/termini/${editTermin.id}`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify({ vrijemePocetka: terminData.vrijemePocetka, vrijemeKraja: terminData.vrijemeKraja, cijena: terminData.cijena }) });
    } else {
      await fetch(`${API}/objekti/${terminiObjektId}/termini`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ datumPocetka: terminData.datum, vrijemePocetka: terminData.vrijemePocetka, vrijemeKraja: terminData.vrijemeKraja, cijena: terminData.cijena, ponavljajDo: terminData.ponavljaj ? terminData.ponavljajDo : undefined }) });
    }
    fetch(`${API}/objekti/${terminiObjektId}/termini`, { headers }).then(r => r.json()).then(setTermini);
    setShowDodajTermin(false); setEditTermin(null);
    setTerminData({ datum: "", vrijemePocetka: "", vrijemeKraja: "", cijena: "", ponavljajDo: "", ponavljaj: false });
    prikaziPoruku("Termin spremljen.");
  };

  const obrisiTermin = async (id: number) => {
    if (!confirm("Obrisati termin?")) return;
    await fetch(`${API}/termini/${id}`, { method: "DELETE", headers });
    setTermini(t => t.filter(x => x.id !== id));
  };

  const spremiObjekt = async () => {
  let lat = null, lng = null;
  try {
    const upit = encodeURIComponent(`${objektData.adresa}, Rijeka`);
    const geoRes = await fetch(`https://photon.komoot.io/api/?q=${upit}&limit=1&lang=default`);
    const geoData = await geoRes.json();
    const feature = geoData.features?.[0];
    if (feature) {
      lng = feature.geometry.coordinates[0];
      lat = feature.geometry.coordinates[1];
    }
  } catch (e) {
    console.warn("Geocoding nije uspio:", e);
  }

  const body = { 
    ...objektData, 
    kapacitet: objektData.kapacitet ? Number(objektData.kapacitet) : null, 
    vlasnikId: objektData.vlasnikId ? Number(objektData.vlasnikId) : null, 
    idKluba: objektData.idKluba ? Number(objektData.idKluba) : null, 
    sportovi: odabraniSportovi,
    lat,
    lng,
  };
  if (objektMod === "dodaj") {
    await fetch(`${API}/objekti`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
  } else {
    await fetch(`${API}/objekti/${editObjektId}`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify(body) });
  }
  ucitajObjekte();
  setShowObjektModal(false); prikaziPoruku("Objekt spremljen.");
};

  const odobriObjekt = async (id: number) => {
    await fetch(`${API}/objekti/${id}/odobri`, { method: "PUT", headers });
    setObjekti(o => o.map(obj => obj.id === id ? { ...obj, status_objekta: "Aktivan" } : obj));
    prikaziPoruku("Objekt odobren!");
  };

  const obrisiObjekt = async (id: number) => {
    if (!confirm("Obrisati objekt?")) return;
    await fetch(`${API}/objekti/${id}`, { method: "DELETE", headers });
    setObjekti(o => o.filter(obj => obj.id !== id));
  };

  const potvrdiObrisiObjekt = async (id: number) => {
    if (!confirm("Potvrditi brisanje objekta? Ova akcija je nepovratna.")) return;
    await fetch(`${API}/objekti/${id}/potvrdi-brisanje`, { method: "PUT", headers });
    setObjekti(o => o.filter(obj => obj.id !== id));
    prikaziPoruku("Objekt obrisan.");
  };

  const odbijObrisiObjekt = async (id: number) => {
    await fetch(`${API}/objekti/${id}/odbij-brisanje`, { method: "PUT", headers });
    setObjekti(o => o.map(obj => obj.id === id ? { ...obj, status_objekta: "Aktivan" } : obj));
    prikaziPoruku("Zahtjev za brisanje odbijen.");
  };

  const spremiKorisnika = async () => {
    await fetch(`${API}/korisnici`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(noviKorisnik) });
    fetch(`${API}/korisnici`, { headers }).then(r => r.json()).then(setKorisnici);
    setShowKorisnikModal(false); setNoviKorisnik({ ime: "", prezime: "", email: "", lozinka: "", brojMobitela: "", uloga: "User" });
    prikaziPoruku("Korisnik dodan.");
  };

  const promijeniUlogu = async (id: number, uloga: string) => {
    await fetch(`${API}/korisnici/${id}/uloga`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify({ uloga }) });
    setKorisnici(k => k.map(u => u.id === id ? { ...u, uloga } : u));
    prikaziPoruku("Uloga ažurirana.");
  };

  const obrisiKorisnika = async (id: number) => {
    if (!confirm("Obrisati korisnika?")) return;
    await fetch(`${API}/korisnici/${id}`, { method: "DELETE", headers });
    setKorisnici(k => k.filter(u => u.id !== id));
  };

  const spremiKlub = async () => {
    if (klubMod === "dodaj") {
      await fetch(`${API}/klubovi`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(klubData) });
    } else {
      await fetch(`${API}/klubovi/${editKlubId}`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify(klubData) });
    }
    ucitajKlubove();
    setShowKlubModal(false); prikaziPoruku("Klub spremljen.");
  };

  const obrisiKlub = async (id: number) => {
    if (!confirm("Obrisati klub?")) return;
    await fetch(`${API}/klubovi/${id}`, { method: "DELETE", headers });
    setKlubovi(k => k.filter(x => x.id !== id));
  };

  const obrisiRecenziju = async (idK: number, idO: number) => {
    if (!confirm("Obrisati recenziju?")) return;
    await fetch(`${API}/recenzije/${idK}/${idO}`, { method: "DELETE", headers });
    setRecenzije(r => r.filter(rec => !(rec.idKorisnika === idK && rec.idObjekta === idO)));
  };

  const tabStyle = (t: Tab) => ({
    padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
    background: aktivnaTab === t ? "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)" : "#fff",
    color: aktivnaTab === t ? "#fff" : "#374151",
    boxShadow: aktivnaTab === t ? "0 2px 8px rgba(29,78,216,0.3)" : "0 1px 4px rgba(0,0,0,0.08)"
  });

  if (ucitavanje || !korisnik) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FF", paddingTop: 16, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 12px" }}>

        <div style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", borderRadius: 20, padding: "20px 24px", marginBottom: 24, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>🛡️ Admin panel</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{korisnik.ime} {korisnik.prezime} · Administrator</div>
          </div>
          {poruka && <div style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.2)", fontWeight: 600 }}>✓ {poruka}</div>}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {(["dashboard", "korisnici", "objekti", "klubovi", "recenzije"] as Tab[]).map(t => (
            <button key={t} onClick={() => setAktivnaTab(t)} style={tabStyle(t)}>
              {{ dashboard: "📊 Dashboard", korisnici: "👥 Korisnici", objekti: "🏟️ Objekti", klubovi: "⚽ Klubovi", recenzije: "⭐ Recenzije" }[t]}
            </button>
          ))}
        </div>

        {ucitava && <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Učitavanje...</div>}

        {aktivnaTab === "dashboard" && !ucitava && dashboard && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* STAT KARTICE */}
            <div className="admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Korisnici", v: dashboard.ukupnoKorisnika, boja: "#3B82F6", bg: "#EFF6FF", e: "👤" },
                { label: "Aktivni objekti", v: dashboard.ukupnoObjekta, boja: "#10B981", bg: "#ECFDF5", e: "🏟️" },
                { label: "Rezervacije", v: dashboard.ukupnoRezervacija, boja: "#6366F1", bg: "#EEF2FF", e: "📅" },
                { label: "Recenzije", v: dashboard.ukupnoRecenzija, boja: "#F59E0B", bg: "#FFFBEB", e: "⭐" },
              ].map(k => (
                <div key={k.label} style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{k.e}</div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: k.boja, lineHeight: 1 }}>{k.v}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* DRUGI RED */}
            <div className="admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Vlasnici", v: dashboard.ukupnoVlasnika, boja: "#8B5CF6", bg: "#F5F3FF", e: "🏢" },
                { label: "Klubovi", v: dashboard.ukupnoKlubova, boja: "#06B6D4", bg: "#ECFEFF", e: "⚽" },
                { label: "Na čekanju odobrenja", v: dashboard.ukupnoPending, boja: "#EF4444", bg: "#FEF2F2", e: "⏳" },
              ].map(k => (
                <div key={k.label} style={{ background: "#fff", borderRadius: 16, padding: "18px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{k.e}</div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: k.boja, lineHeight: 1 }}>{k.v}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>{k.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* DONJI RED */}
            {dashboardExtra && (
              <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* TOP OBJEKTI */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827" }}>🏆 Top objekti po rezervacijama</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {dashboardExtra.topObjekti.map((obj, i) => (
                      <div key={obj.naziv} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: i === 0 ? "#FFFBEB" : "#FAFAFA", border: `1px solid ${i === 0 ? "#FDE68A" : "#F3F4F6"}` }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#B45309" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{obj.naziv}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{obj.kvart}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#6366F1" }}>{obj.brojRezervacija} rez.</div>
                          {obj.ocjena && <div style={{ fontSize: 11, color: "#F59E0B" }}>⭐ {obj.ocjena}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATISTIKE */}
<div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827" }}>📈 Statistike rezervacija</h3>
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

    <div className="admin-grid-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
        <div style={{ fontSize: 11, color: "#0369A1", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Termini danas</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#0284C7", marginTop: 4 }}>{dashboardExtra.stats.danas}</div>
        <div style={{ fontSize: 11, color: "#7DD3FC" }}>zauzeto</div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <div style={{ fontSize: 11, color: "#15803D", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Termini ovaj tjedan</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>{dashboardExtra.stats.ovajTjedan}</div>
        <div style={{ fontSize: 11, color: "#86EFAC" }}>zauzeto</div>
      </div>
    </div>

    <div className="admin-grid-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Termini ovaj mjesec</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#374151", marginTop: 4 }}>{dashboardExtra.stats.ovajMjesec}</div>
        <div style={{ fontSize: 11, color: "#9CA3AF" }}>zauzeto</div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <div style={{ fontSize: 11, color: "#92400E", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Prihod ovaj mjesec</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#D97706", marginTop: 4 }}>{dashboardExtra.stats.prihodMjesec}€</div>
        <div style={{ fontSize: 11, color: "#FCD34D" }}>ukupno</div>
      </div>
    </div>

  </div>
</div>

              </div>
            )}

          </div>
        )}

        {aktivnaTab === "korisnici" && !ucitava && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Korisnici ({korisnici.length})</h2>
              <button onClick={() => setShowKorisnikModal(true)} style={btnPrimary}>+ Dodaj korisnika</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["ID", "Ime i prezime", "Email", "Mobitel", "Uloga", "Akcije"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {korisnici.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", color: "#9CA3AF" }}>{u.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{u.ime} {u.prezime}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{u.brojMobitela || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <select value={u.uloga} onChange={e => promijeniUlogu(u.id, e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, fontWeight: 600, color: u.uloga === "Admin" ? "#7C3AED" : u.uloga === "Vlasnik" ? "#1D4ED8" : "#374151" }}>
                          <option value="User">User</option>
                          <option value="Vlasnik">Vlasnik</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {u.id !== korisnik.id && <button onClick={() => obrisiKorisnika(u.id)} style={btnDanger}>Obriši</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aktivnaTab === "objekti" && !ucitava && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Objekti ({objekti.length})
                {objekti.filter(o => o.status_objekta === "Pending").length > 0 && (
                  <span style={{ marginLeft: 10, padding: "3px 10px", borderRadius: 8, background: "#FEF3C7", color: "#D97706", fontSize: 13 }}>
                    {objekti.filter(o => o.status_objekta === "Pending").length} na čekanju
                  </span>
                )}
                {objekti.filter(o => o.status_objekta === "PendingDelete").length > 0 && (
                  <span style={{ marginLeft: 6, padding: "3px 10px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", fontSize: 13 }}>
                    {objekti.filter(o => o.status_objekta === "PendingDelete").length} čeka brisanje
                  </span>
                )}
              </h2>
              <button onClick={() => {
                setObjektMod("dodaj"); setEditObjektId(null);
                setObjektData({ naziv: "", adresa: "", kvart: "", kapacitet: "", opis: "", slikaUrl: "", vlasnikId: "", idKluba: "" });
                setOdabraniSportovi([]); setNoviKvartAdmin(false); setShowObjektModal(true);
              }} style={btnPrimary}>+ Dodaj objekt</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {[...objekti].sort((a, b) => {
    const prioritet = (s: string) => s === "Pending" ? 0 : s === "PendingDelete" ? 1 : 2;
    return prioritet(a.status_objekta) - prioritet(b.status_objekta);
  }).map(o => (
                <div key={o.id} style={{ padding: 16, borderRadius: 12, border: `1px solid ${o.status_objekta === "Pending" ? "#FDE68A" : o.status_objekta === "PendingDelete" ? "#FECACA" : "#E5E7EB"}`, background: o.status_objekta === "Pending" ? "#FFFBEB" : o.status_objekta === "PendingDelete" ? "#FEF2F2" : "#fff" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {o.slikaUrl && <img src={o.slikaUrl} alt="" style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <a href={`/objekt/${o.id}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, fontSize: 15, color: "#111827", textDecoration: "none" }}>
                          {o.naziv} <span style={{ fontSize: 12, color: "#3B82F6" }}>↗</span>
                        </a>
                        <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                          background: o.status_objekta === "Pending" ? "#FEF3C7" : o.status_objekta === "PendingDelete" ? "#FEE2E2" : "#D1FAE5",
                          color: o.status_objekta === "Pending" ? "#D97706" : o.status_objekta === "PendingDelete" ? "#DC2626" : "#059669" }}>
                          {o.status_objekta === "Pending" ? "⏳ Na čekanju" : o.status_objekta === "PendingDelete" ? "🗑️ Čeka brisanje" : "✅ Aktivan"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{o.adresa}, {o.kvart}</div>
                      <div style={{ fontSize: 13, color: "#9CA3AF" }}>Vlasnik: {o.vlasnik} · Klub: {o.nazivKluba || "—"} · {o.sportovi || "bez sportova"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {o.status_objekta === "Pending" && <button onClick={() => odobriObjekt(o.id)} style={btnSuccess}>✓ Odobri</button>}
                      {o.status_objekta === "PendingDelete" && (
                        <>
                          <button onClick={() => potvrdiObrisiObjekt(o.id)} style={{ ...btnDanger, background: "#DC2626", color: "#fff" }}>🗑️ Potvrdi brisanje</button>
                          <button onClick={() => odbijObrisiObjekt(o.id)} style={btnSecondary}>↩ Odbij</button>
                        </>
                      )}
                      <button onClick={() => ucitajTermine(o.id, o.naziv)} style={btnSecondary}>Termini</button>
                      <button onClick={() => {
                        setObjektMod("uredi"); setEditObjektId(o.id);
                        setObjektData({ naziv: o.naziv, adresa: o.adresa, kvart: o.kvart, kapacitet: o.kapacitet ? String(o.kapacitet) : "", opis: o.opis || "", slikaUrl: o.slikaUrl || "", vlasnikId: o.vlasnikId ? String(o.vlasnikId) : "", idKluba: o.idKluba ? String(o.idKluba) : "" });
                        const sportIdjevi = o.sportovi ? sviSportovi.filter(s => o.sportovi.split(", ").includes(s.Naziv_sporta)).map(s => s.ID_sporta) : [];
                        setOdabraniSportovi(sportIdjevi); setNoviKvartAdmin(false); setShowObjektModal(true);
                      }} style={btnSecondary}>Uredi</button>
                      <button onClick={() => obrisiObjekt(o.id)} style={btnDanger}>Obriši</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {aktivnaTab === "klubovi" && !ucitava && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Klubovi ({klubovi.length})</h2>
              <button onClick={() => { setKlubMod("dodaj"); setEditKlubId(null); setKlubData({ naziv: "", oib: "", kontakt: "" }); setShowKlubModal(true); }} style={btnPrimary}>+ Dodaj klub</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["Naziv", "OIB", "Kontakt", "Objekti", "Akcije"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, borderBottom: "2px solid #E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {klubovi.map(k => (
                    <tr key={k.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{k.naziv}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280", fontFamily: "monospace" }}>{k.oib}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{k.kontakt || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280" }}>{k.objektiNazivi.length > 0 ? k.objektiNazivi.map((n, i) => <div key={i} style={{ fontSize: 13 }}>• {n}</div>) : "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setKlubMod("uredi"); setEditKlubId(k.id); setKlubData({ naziv: k.naziv, oib: k.oib, kontakt: k.kontakt || "" }); setShowKlubModal(true); }} style={btnSecondary}>Uredi</button>
                          <button onClick={() => obrisiKlub(k.id)} style={btnDanger}>Obriši</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aktivnaTab === "recenzije" && !ucitava && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recenzije ({recenzije.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recenzije.map(r => (
                <div key={`${r.idKorisnika}-${r.idObjekta}`} style={{ padding: 16, borderRadius: 12, border: "1px solid #E5E7EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700 }}>{r.ime} {r.prezime}</span>
                        <span style={{ fontSize: 13, color: "#6B7280" }}>→ {r.nazivObjekta}</span>
                        <span>{"⭐".repeat(r.ocjena)}</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{new Date(r.datum).toLocaleDateString("hr-HR")}</span>
                      </div>
                      {r.komentar && <div style={{ fontSize: 14, color: "#374151" }}>{r.komentar}</div>}
                    </div>
                    <button onClick={() => obrisiRecenziju(r.idKorisnika, r.idObjekta)} style={btnDanger}>Obriši</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showTerminiModal && (
          <Modal onClose={() => { setShowTerminiModal(false); setShowDodajTermin(false); setEditTermin(null); }} title={`Termini — ${terminiObjektNaziv}`}>
            <button onClick={() => { setShowDodajTermin(true); setEditTermin(null); setTerminData({ datum: "", vrijemePocetka: "", vrijemeKraja: "", cijena: "", ponavljajDo: "", ponavljaj: false }); }} style={{ ...btnPrimary, marginBottom: 16 }}>+ Dodaj termin</button>
            {showDodajTermin && (
              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{editTermin ? "Uredi termin" : "Novi termin"}</div>
                {!editTermin && <div><label style={{ fontSize: 12, fontWeight: 600 }}>Datum</label><input type="date" value={terminData.datum} onChange={e => setTerminData({ ...terminData, datum: e.target.value })} style={inputStyle} /></div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 600 }}>Početak</label><input type="time" value={terminData.vrijemePocetka} onChange={e => setTerminData({ ...terminData, vrijemePocetka: e.target.value })} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 600 }}>Kraj</label><input type="time" value={terminData.vrijemeKraja} onChange={e => setTerminData({ ...terminData, vrijemeKraja: e.target.value })} style={inputStyle} /></div>
                </div>
                <div><label style={{ fontSize: 12, fontWeight: 600 }}>Cijena (€)</label><input type="number" value={terminData.cijena} onChange={e => setTerminData({ ...terminData, cijena: e.target.value })} style={inputStyle} /></div>
                {!editTermin && (
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                    <input type="checkbox" checked={terminData.ponavljaj} onChange={e => setTerminData({ ...terminData, ponavljaj: e.target.checked })} />
                    Ponavljaj tjedno do:
                    {terminData.ponavljaj && <input type="date" value={terminData.ponavljajDo} onChange={e => setTerminData({ ...terminData, ponavljajDo: e.target.value })} style={{ ...inputStyle, width: "auto" }} />}
                  </label>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowDodajTermin(false); setEditTermin(null); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>Odustani</button>
                  <button onClick={spremiTermin} style={{ ...btnPrimary, flex: 1 }}>Spremi</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
              {termini.length === 0 && <p style={{ color: "#9CA3AF", textAlign: "center" }}>Nema termina.</p>}
              {termini.map(t => (
                <div key={t.id} style={{ padding: 12, borderRadius: 10, border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(t.datum).toLocaleDateString("hr-HR")} · {t.vrijemePocetka}–{t.vrijemeKraja}</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>{t.cijena} € · <span style={{ color: t.status === "Slobodan" ? "#059669" : "#DC2626" }}>{t.status}</span>{t.korisnik ? ` · ${t.korisnik}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditTermin(t); setTerminData({ datum: t.datum, vrijemePocetka: t.vrijemePocetka, vrijemeKraja: t.vrijemeKraja, cijena: String(t.cijena), ponavljajDo: "", ponavljaj: false }); setShowDodajTermin(true); }} style={btnSecondary}>Uredi</button>
                    <button onClick={() => obrisiTermin(t.id)} style={btnDanger}>Obriši</button>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )}

        {showObjektModal && (
          <Modal onClose={() => setShowObjektModal(false)} title={objektMod === "dodaj" ? "Dodaj objekt" : "Uredi objekt"}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Naziv *</label><input value={objektData.naziv} onChange={e => setObjektData({ ...objektData, naziv: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Adresa *</label><input value={objektData.adresa} onChange={e => setObjektData({ ...objektData, adresa: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Kvart *</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!noviKvartAdmin ? (
                    <select value={objektData.kvart} onChange={(e) => setObjektData({ ...objektData, kvart: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
                      <option value="">— odaberi kvart —</option>
                      {sviKvartovi.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder="Novi kvart..." value={objektData.kvart} onChange={(e) => setObjektData({ ...objektData, kvart: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  )}
                  <button type="button" onClick={() => { setNoviKvartAdmin(!noviKvartAdmin); setObjektData({ ...objektData, kvart: "" }); }}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: noviKvartAdmin ? "#EEF2FF" : "#fff", color: "#1D4ED8", cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>
                    {noviKvartAdmin ? "↩ Odaberi" : "+ Novi"}
                  </button>
                </div>
              </div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Kapacitet</label><input type="number" value={objektData.kapacitet} onChange={e => setObjektData({ ...objektData, kapacitet: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Vlasnik</label>
                <select value={objektData.vlasnikId} onChange={e => setObjektData({ ...objektData, vlasnikId: e.target.value })} style={inputStyle}>
                  <option value="">— bez vlasnika —</option>
                  {sviVlasnici.map(v => <option key={v.id} value={v.id}>{v.ime} {v.prezime} ({v.email})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Klub</label>
                <select value={objektData.idKluba} onChange={e => setObjektData({ ...objektData, idKluba: e.target.value })} style={inputStyle}>
                  <option value="">— bez kluba —</option>
                  {klubovi.map(k => <option key={k.id} value={k.id}>{k.naziv}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Sportovi</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 130, overflowY: "auto", padding: 10, border: "1.5px solid #E5E7EB", borderRadius: 10 }}>
                  {sviSportovi.map(s => (
                    <label key={s.ID_sporta} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={odabraniSportovi.includes(s.ID_sporta)} onChange={() => setOdabraniSportovi(prev => prev.includes(s.ID_sporta) ? prev.filter(x => x !== s.ID_sporta) : [...prev, s.ID_sporta])} />
                      {s.Naziv_sporta}
                    </label>
                  ))}
                </div>
              </div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Opis</label><textarea value={objektData.opis} onChange={e => setObjektData({ ...objektData, opis: e.target.value })} style={{ ...inputStyle, minHeight: 70 }} /></div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600 }}>URL slike</label>
                <input value={objektData.slikaUrl} onChange={e => setObjektData({ ...objektData, slikaUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
                {objektData.slikaUrl && <img src={objektData.slikaUrl} alt="" style={{ marginTop: 8, width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setShowObjektModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>Odustani</button>
                <button onClick={spremiObjekt} style={{ ...btnPrimary, flex: 1 }}>Spremi</button>
              </div>
            </div>
          </Modal>
        )}

        {showKorisnikModal && (
          <Modal onClose={() => setShowKorisnikModal(false)} title="Dodaj korisnika">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Ime *</label><input value={noviKorisnik.ime} onChange={e => setNoviKorisnik({ ...noviKorisnik, ime: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Prezime *</label><input value={noviKorisnik.prezime} onChange={e => setNoviKorisnik({ ...noviKorisnik, prezime: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Email *</label><input type="email" value={noviKorisnik.email} onChange={e => setNoviKorisnik({ ...noviKorisnik, email: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Lozinka *</label><input type="password" value={noviKorisnik.lozinka} onChange={e => setNoviKorisnik({ ...noviKorisnik, lozinka: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Broj mobitela</label><input value={noviKorisnik.brojMobitela} onChange={e => setNoviKorisnik({ ...noviKorisnik, brojMobitela: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Uloga</label>
                <select value={noviKorisnik.uloga} onChange={e => setNoviKorisnik({ ...noviKorisnik, uloga: e.target.value })} style={inputStyle}>
                  <option value="User">User</option>
                  <option value="Vlasnik">Vlasnik</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setShowKorisnikModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>Odustani</button>
                <button onClick={spremiKorisnika} style={{ ...btnPrimary, flex: 1 }}>Dodaj</button>
              </div>
            </div>
          </Modal>
        )}

        {showKlubModal && (
          <Modal onClose={() => setShowKlubModal(false)} title={klubMod === "dodaj" ? "Dodaj klub" : "Uredi klub"}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Naziv kluba *</label><input value={klubData.naziv} onChange={e => setKlubData({ ...klubData, naziv: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>OIB *</label><input value={klubData.oib} onChange={e => setKlubData({ ...klubData, oib: e.target.value })} maxLength={11} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 600 }}>Kontakt telefon</label><input value={klubData.kontakt} onChange={e => setKlubData({ ...klubData, kontakt: e.target.value })} style={inputStyle} /></div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setShowKlubModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}>Odustani</button>
                <button onClick={spremiKlub} style={{ ...btnPrimary, flex: 1 }}>Spremi</button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}