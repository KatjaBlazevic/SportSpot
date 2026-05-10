import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface OmiljeniObjekt {
  id: number;
  naziv: string;
  adresa: string;
}

interface Rezervacija {
  ID_termina: number;
  ID_objekta: number;
  Naziv_objekta: string;
  Adresa: string;
  Kvart: string;
  Naziv_kluba: string | null;
  Datum: string;
  vrijeme_pocetka: string;
  vrijeme_kraja: string;
  Cijena: number;
  Status: string;
}

interface MojObjekt {
  ID_objekta: number;
  Naziv_objekta: string;
  Adresa: string;
  Kvart: string;
  Kapacitet: number | null;
  Opis: string | null;
  sportovi: string | null;
  Slika_url: string | null;
  Status_objekta: string;
}

interface Sport {
  ID_sporta: number;
  Naziv_sporta: string;
}

interface StatistikaMjesec {
  mjesec: string;
  brojRezervacija: number;
  prihod: number;
}

interface StatistikaObjekt {
  id: number;
  naziv: string;
  zauzeti: number;
  slobodni: number;
  ukupnoTermina: number;
  ukupniPrihod: number;
}

interface Statistika {
  poMjesecima: StatistikaMjesec[];
  poObjektima: StatistikaObjekt[];
}

export default function ProfilVlasnik() {
  const { korisnik, token, ucitavanje, osvjezi } = useAuth();
  const navigate = useNavigate();
  const [omiljeni, setOmiljeni] = useState<OmiljeniObjekt[]>(() => {
    const saved = localStorage.getItem("sportspot_omiljeni");
    if (saved) {
      try { return JSON.parse(saved); }
      catch { return []; }
    }
    return [];
  });

  const [rezervacije, setRezervacije] = useState<Rezervacija[]>([]);
  const [mojiObjekti, setMojiObjekti] = useState<MojObjekt[]>([]);
  const [aktivnaTab, setAktivnaTab] = useState<"mojiObjekti" | "rezervacije" | "omiljeni" | "statistika">("mojiObjekti");
  const [ucitavanjeRez, setUcitavanjeRez] = useState(false);
  const [ucitavanjeObjekti, setUcitavanjeObjekti] = useState(false);

  const [sviSportovi, setSviSportovi] = useState<Sport[]>([]);
  const [odabraniSportovi, setOdabraniSportovi] = useState<number[]>([]);

  const [statistika, setStatistika] = useState<Statistika | null>(null);
  const [ucitavanjeStatistike, setUcitavanjeStatistike] = useState(false);

  // Profil modal
  const [showModal, setShowModal] = useState(false);
  const [spremanje, setSpremanje] = useState(false);
  const [poruka, setPoruka] = useState("");
  const [editData, setEditData] = useState({
    ime: "", prezime: "", email: "", brojMobitela: "", novaLozinka: "", potvrdaLozinke: "",
  });

  // Objekt modal
  const [showObjektModal, setShowObjektModal] = useState(false);
  const [objektMod, setObjektMod] = useState<"dodaj" | "uredi">("dodaj");
  const [objektSpremanje, setObjektSpremanje] = useState(false);
  const [objektPoruka, setObjektPoruka] = useState("");
  const [editObjektId, setEditObjektId] = useState<number | null>(null);
  const [objektData, setObjektData] = useState({
    naziv: "", adresa: "", kvart: "", kapacitet: "", opis: "", slikaUrl: "" 
  });

  useEffect(() => {
    if (!ucitavanje && !korisnik) navigate("/prijava");
  }, [ucitavanje, korisnik, navigate]);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/sportovi", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setSviSportovi(data || []))
        .catch((err) => console.error("Greška pri dohvatu sportova", err));
    }
  }, [token]);

  useEffect(() => {
    if (aktivnaTab === "mojiObjekti" && token) {
      setUcitavanjeObjekti(true);
      fetch("http://localhost:5000/api/moji-objekti", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => { setMojiObjekti(data || []); setUcitavanjeObjekti(false); })
        .catch(() => setUcitavanjeObjekti(false));
    }
  }, [aktivnaTab, token]);

  useEffect(() => {
    if (aktivnaTab === "rezervacije" && token) {
      setUcitavanjeRez(true);
      fetch("http://localhost:5000/api/moje-rezervacije", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => { setRezervacije(data || []); setUcitavanjeRez(false); })
        .catch(() => setUcitavanjeRez(false));
    }
  }, [aktivnaTab, token]);

  useEffect(() => {
    if (aktivnaTab === "statistika" && token && !statistika) {
      setUcitavanjeStatistike(true);
      fetch("http://localhost:5000/api/objekti/vlasnik/statistika", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => { setStatistika(data); setUcitavanjeStatistike(false); })
        .catch(() => setUcitavanjeStatistike(false));
    }
  }, [aktivnaTab, token, statistika]);

  // --- Profil modal funkcije ---
  const otvoriModal = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/profile", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEditData({ ime: data.ime || korisnik?.ime || "", prezime: data.prezime || korisnik?.prezime || "", email: data.email || korisnik?.email || "", brojMobitela: data.brojMobitela || "", novaLozinka: "", potvrdaLozinke: "" });
    } catch {
      setEditData({ ime: korisnik?.ime || "", prezime: korisnik?.prezime || "", email: korisnik?.email || "", brojMobitela: "", novaLozinka: "", potvrdaLozinke: "" });
    }
    setPoruka(""); setShowModal(true);
  };

  const zatvoriModal = () => { setShowModal(false); setPoruka(""); };

  const spremiPromjene = async () => {
    if (editData.novaLozinka && editData.novaLozinka !== editData.potvrdaLozinke) { setPoruka("Lozinke se ne podudaraju."); return; }
    setSpremanje(true);
    try {
      const res = await fetch("http://localhost:5000/api/profile/update", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ime: editData.ime, prezime: editData.prezime, email: editData.email, brojMobitela: editData.brojMobitela || null, novaLozinka: editData.novaLozinka || null }),
      });
      if (res.ok) { osvjezi({ ...korisnik!, ime: editData.ime, prezime: editData.prezime, email: editData.email }); setShowModal(false); }
      else { setPoruka("Greška pri spremanju."); }
    } catch { setPoruka("Greška sa serverom."); }
    finally { setSpremanje(false); }
  };

  // --- Objekt modal funkcije ---
  const osvjeziObjekte = () => {
    setUcitavanjeObjekti(true);
    fetch("http://localhost:5000/api/moji-objekti", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setMojiObjekti(data || []); setUcitavanjeObjekti(false); })
      .catch(() => setUcitavanjeObjekti(false));
  };

  const otvoriDodajObjekt = () => {
    setObjektData({ naziv: "", adresa: "", kvart: "", kapacitet: "", opis: "", slikaUrl: "" }); 
    setOdabraniSportovi([]);
    setObjektMod("dodaj");
    setEditObjektId(null);
    setObjektPoruka("");
    setShowObjektModal(true);
  };

  const otvoriUrediObjekt = (obj: MojObjekt) => {
    setObjektData({
      naziv: obj.Naziv_objekta,
      adresa: obj.Adresa,
      kvart: obj.Kvart,
      kapacitet: obj.Kapacitet !== null ? String(obj.Kapacitet) : "",
      opis: obj.Opis || "",
      slikaUrl: obj.Slika_url || "", 
    });
    if (obj.sportovi) {
      const imena = obj.sportovi.split(", ");
      const idjevi = sviSportovi.filter((s) => imena.includes(s.Naziv_sporta)).map((s) => s.ID_sporta);
      setOdabraniSportovi(idjevi);
    } else {
      setOdabraniSportovi([]);
    }
    setObjektMod("uredi");
    setEditObjektId(obj.ID_objekta);
    setObjektPoruka("");
    setShowObjektModal(true);
  };

  const zatvoriObjektModal = () => { setShowObjektModal(false); setObjektPoruka(""); };

  const handleSportToggle = (id: number) => {
    setOdabraniSportovi(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const spremiObjekt = async () => {
    if (!objektData.naziv || !objektData.adresa || !objektData.kvart) {
      setObjektPoruka("Naziv, adresa i kvart su obavezni.");
      return;
    }
    setObjektSpremanje(true);
    try {
      const body = {
        ...objektData,
        kapacitet: objektData.kapacitet ? Number(objektData.kapacitet) : null,
        opis: objektData.opis || null,
        slikaUrl: objektData.slikaUrl || null, 
        sportovi: odabraniSportovi,
      };
      const url = objektMod === "uredi" ? `http://localhost:5000/api/objekti/${editObjektId}` : "http://localhost:5000/api/objekti";
      const method = objektMod === "uredi" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { osvjeziObjekte(); zatvoriObjektModal(); }
      else { setObjektPoruka("Greška pri spremanju."); }
    } catch { setObjektPoruka("Greška sa serverom."); }
    finally { setObjektSpremanje(false); }
  };

  const ukloniOmiljeni = (id: number) => { const n = omiljeni.filter((o) => o.id !== id); setOmiljeni(n); localStorage.setItem("sportspot_omiljeni", JSON.stringify(n)); };
  const formatirajDatum = (d: string) => { const d1 = new Date(d); const m = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"]; return `${d1.getDate()}. ${m[d1.getMonth()]} ${d1.getFullYear()}.`; };
  const getStatusBoja = (s: string) => s === "Potvrđeno" ? { bg: "#D1FAE5", color: "#059669" } : s === "Odbijeno" ? { bg: "#FEE2E2", color: "#DC2626" } : { bg: "#FEF3C7", color: "#D97706" };

  const formatirajMjesec = (mjesecStr: string) => {
    const [godina, mj] = mjesecStr.split("-");
    const nazivi = ["Sij", "Velj", "Ožu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"];
    return `${nazivi[parseInt(mj) - 1]} ${godina}`;
  };

  if (ucitavanje || !korisnik) return null;

  const ukupnoRezervacija = statistika?.poObjektima.reduce((s, o) => s + o.zauzeti, 0) ?? 0;
  const ukupniPrihod = statistika?.poObjektima.reduce((s, o) => s + o.ukupniPrihod, 0) ?? 0;
  const ukupnoTermina = statistika?.poObjektima.reduce((s, o) => s + o.ukupnoTermina, 0) ?? 0;
  const popunjenost = ukupnoTermina > 0 ? Math.round((ukupnoRezervacija / ukupnoTermina) * 100) : 0;
  const maxRezervacija = statistika ? Math.max(...statistika.poMjesecima.map((m) => m.brojRezervacija), 1) : 1;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#F5F7FA", padding: "32px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header Profila */}
        <div style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", borderRadius: 24, padding: 32, marginBottom: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800, color: "#1D4ED8" }}>{korisnik.ime.charAt(0)}{korisnik.prezime.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{korisnik.ime} {korisnik.prezime}</h1>
              <p style={{ fontSize: 16, margin: "8px 0 0", opacity: 0.9 }}>{korisnik.email}</p>
            </div>
            <button onClick={otvoriModal} style={{ padding: "12px 24px", borderRadius: 12, background: "#fff", color: "#1D4ED8", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Uredi profil</button>
          </div>
        </div>

        {/* Tabs navigacija */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["mojiObjekti", "rezervacije", "omiljeni", "statistika"] as const).map((tab) => {
            const labels: Record<string, string> = {
              mojiObjekti: "🏟️ Moji objekti",
              rezervacije: "📅 Moje rezervacije",
              omiljeni: "❤️ Omiljeni",
              statistika: "📊 Statistika",
            };
            return (
              <button key={tab} onClick={() => setAktivnaTab(tab)} style={{ padding: "14px 24px", borderRadius: 14, background: aktivnaTab === tab ? "#1D4ED8" : "#fff", color: aktivnaTab === tab ? "#fff" : "#374151", fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer" }}>
                {labels[tab]}
                {tab === "omiljeni" && omiljeni.length > 0 && (
                  <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 10, background: aktivnaTab === tab ? "rgba(255,255,255,0.2)" : "#FEE2E2", fontSize: 12, color: aktivnaTab === tab ? "#fff" : "#EF4444" }}>{omiljeni.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: Moji Objekti */}
        {aktivnaTab === "mojiObjekti" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>🏟️ Moji objekti</h2>
              <button onClick={otvoriDodajObjekt} style={{ padding: "10px 20px", borderRadius: 10, background: "#fff", color: "#1D4ED8", fontWeight: 600, fontSize: 14, border: "1.5px solid #1D4ED8", cursor: "pointer" }}>+ Dodaj objekt</button>
            </div>
            {ucitavanjeObjekti ? <p style={{ color: "#6B7280", textAlign: "center", padding: 40 }}>Učitavam...</p> : mojiObjekti.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}><div style={{ fontSize: 48 }}>🏟️</div><p>Nemate dodanih objekata.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mojiObjekti.map((obj) => (
  <div key={obj.ID_objekta} style={{ padding: 20, borderRadius: 16, border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Link to={`/objekt/${obj.ID_objekta}`} style={{ flex: 1, textDecoration: "none" }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{obj.Naziv_objekta}</div>
      <span style={{ display: "inline-block", marginTop: 4, padding: "2px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: obj.Status_objekta === "Pending" ? "#FEF3C7" : "#D1FAE5", color: obj.Status_objekta === "Pending" ? "#D97706" : "#059669" }}>
                {obj.Status_objekta === "Pending" ? "⏳ Na čekanju" : "✅ Aktivan"}
              </span>
      <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>{obj.Adresa}, {obj.Kvart}</div>
      {obj.sportovi && <div style={{ fontSize: 13, color: "#3B82F6", marginTop: 4 }}>{obj.sportovi}</div>}
      {obj.Slika_url && (
        <div style={{ marginTop: 8 }}>
          <img src={obj.Slika_url} alt="Slika objekta" style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid #E5E7EB" }} />
        </div>
      )}
    </Link>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => otvoriUrediObjekt(obj)} style={{ padding: "8px 16px", borderRadius: 8, background: "#EEF2FF", color: "#1D4ED8", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>Uredi</button>
    </div>
  </div>
))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Rezervacije */}
        {aktivnaTab === "rezervacije" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>📅 Moje rezervacije</h2>
            {ucitavanjeRez ? <p style={{ color: "#6B7280", textAlign: "center", padding: 40 }}>Učitavam...</p> : rezervacije.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}><div style={{ fontSize: 48 }}>📅</div><p>Nemate rezervacija.</p><Link to="/" style={{ color: "#1D4ED8" }}>Pronađi teren →</Link></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {rezervacije.map((rez) => {
                  const st = getStatusBoja(rez.Status);
                  return (
                    <div key={rez.ID_termina} style={{ padding: 20, borderRadius: 16, border: "1px solid #E5E7EB" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Link to={`/objekt/${rez.ID_objekta}`} style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: "#111827" }}>{rez.Naziv_objekta}</div>
                          <div style={{ fontSize: 14, color: "#6B7280" }}>{rez.Adresa}</div>
                        </Link>
                        <span style={{ padding: "6px 12px", borderRadius: 8, background: st.bg, color: st.color, fontSize: 12, fontWeight: 700 }}>{rez.Status}</span>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 14 }}>
                        <span>📆 {formatirajDatum(rez.Datum)}</span>
                        <span>⏰ {rez.vrijeme_pocetka} - {rez.vrijeme_kraja}</span>
                        <span style={{ fontWeight: 700, color: "#1D4ED8" }}>{rez.Cijena} €</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Omiljeni */}
        {aktivnaTab === "omiljeni" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>❤️ Omiljeni objekti</h2>
            {omiljeni.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}><div style={{ fontSize: 48 }}>❤️</div><p>Nemate omiljenih.</p><Link to="/" style={{ color: "#1D4ED8" }}>Pronađi teren →</Link></div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {omiljeni.map((obj) => (
                  <div key={obj.id} style={{ padding: 20, borderRadius: 16, border: "1px solid #E5E7EB", position: "relative" }}>
                    <Link to={`/objekt/${obj.id}`}><div style={{ fontWeight: 700 }}>{obj.naziv}</div><div style={{ fontSize: 14, color: "#6B7280" }}>{obj.adresa}</div></Link>
                    <button onClick={() => ukloniOmiljeni(obj.id)} style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: "50%", border: "1px solid #FEE2E2", background: "#FEF2F2", color: "#EF4444", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Statistika */}
        {aktivnaTab === "statistika" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {ucitavanjeStatistike ? (
              <div style={{ background: "#fff", borderRadius: 20, padding: 60, textAlign: "center", color: "#6B7280", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <p>Učitavam statistiku...</p>
              </div>
            ) : !statistika || statistika.poObjektima.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 20, padding: 60, textAlign: "center", color: "#9CA3AF", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <p style={{ fontSize: 16 }}>Nemate još podataka za prikaz statistike.</p>
                <p style={{ fontSize: 14 }}>Dodajte objekte i termine kako bi se statistika počela prikazivati.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 }}>
                  {[
                    { ikona: "📅", label: "Ukupno rezervacija", vrijednost: ukupnoRezervacija, boja: "#1D4ED8" },
                    { ikona: "💰", label: "Ukupni prihod", vrijednost: `${ukupniPrihod.toFixed(2)} €`, boja: "#059669" },
                    { ikona: "🏟️", label: "Ukupno termina", vrijednost: ukupnoTermina, boja: "#7C3AED" },
                    { ikona: "📈", label: "Popunjenost", vrijednost: `${popunjenost}%`, boja: "#D97706" },
                  ].map((k) => (
                    <div key={k.label} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", borderTop: `4px solid ${k.boja}` }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{k.ikona}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: k.boja }}>{k.vrijednost}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {statistika.poMjesecima.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 24px" }}>📅 Rezervacije po mjesecima (zadnjih 6 mj.)</h2>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
                      {statistika.poMjesecima.map((m) => (
                        <div key={m.mjesec} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>{m.brojRezervacija}</div>
                          <div style={{ width: "100%", background: "#1D4ED8", borderRadius: "6px 6px 0 0", height: `${Math.max((m.brojRezervacija / maxRezervacija) * 120, 4)}px`, transition: "height 0.3s" }} />
                          <div style={{ fontSize: 11, color: "#6B7280", textAlign: "center" }}>{formatirajMjesec(m.mjesec)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>🏟️ Po objektima</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {statistika.poObjektima.map((o) => (
                      <div key={o.id} style={{ padding: 16, borderRadius: 12, border: "1px solid #E5E7EB" }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>{o.naziv}</div>
                        <div style={{ display: "flex", gap: 20, fontSize: 14, flexWrap: "wrap" }}>
                          <span>✅ Zauzeto: <b>{o.zauzeti}</b></span>
                          <span>🔓 Slobodno: <b>{o.slobodni}</b></span>
                          <span>💰 Prihod: <b style={{ color: "#059669" }}>{o.ukupniPrihod.toFixed(2)} €</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal: Uredi profil */}
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "90%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>Uredi profil</h2>
                <button onClick={zatvoriModal} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Ime</label><input type="text" value={editData.ime} onChange={(e) => setEditData({ ...editData, ime: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Prezime</label><input type="text" value={editData.prezime} onChange={(e) => setEditData({ ...editData, prezime: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Email</label><input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Broj mobitela</label><input type="text" value={editData.brojMobitela} onChange={(e) => setEditData({ ...editData, brojMobitela: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Nova lozinka (opcionalno)</label><input type="password" value={editData.novaLozinka} onChange={(e) => setEditData({ ...editData, novaLozinka: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Potvrda lozinke</label><input type="password" value={editData.potvrdaLozinke} onChange={(e) => setEditData({ ...editData, potvrdaLozinke: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                {poruka && <div style={{ padding: 12, borderRadius: 10, background: poruka.includes("uspješno") ? "#D1FAE5" : "#FEE2E2", color: poruka.includes("uspješno") ? "#059669" : "#DC2626" }}>{poruka}</div>}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={zatvoriModal} style={{ flex: 1, padding: 14, borderRadius: 10, background: "#fff", border: "1.5px solid #E5E7EB", cursor: "pointer" }}>Odustani</button>
                  <button onClick={spremiPromjene} disabled={spremanje} style={{ flex: 1, padding: 14, borderRadius: 10, background: spremanje ? "#93C5FD" : "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", color: "#fff", border: "none", cursor: spremanje ? "not-allowed" : "pointer" }}>{spremanje ? "Spremam..." : "Spremi"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Dodaj/Uredi Objekt */}
        {showObjektModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "90%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>{objektMod === "dodaj" ? "Dodaj objekt" : "Uredi objekt"}</h2>
                <button onClick={zatvoriObjektModal} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Naziv <span style={{ color: "#EF4444" }}>*</span></label><input type="text" value={objektData.naziv} onChange={(e) => setObjektData({ ...objektData, naziv: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Adresa <span style={{ color: "#EF4444" }}>*</span></label><input type="text" value={objektData.adresa} onChange={(e) => setObjektData({ ...objektData, adresa: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Kvart <span style={{ color: "#EF4444" }}>*</span></label><input type="text" value={objektData.kvart} onChange={(e) => setObjektData({ ...objektData, kvart: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Kapacitet</label><input type="number" value={objektData.kapacitet} onChange={(e) => setObjektData({ ...objektData, kapacitet: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }} /></div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Sportovi</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "150px", overflowY: "auto", padding: "12px", border: "1.5px solid #E5E7EB", borderRadius: "10px" }}>
                    {sviSportovi.map((sport) => (
                      <label key={sport.ID_sporta} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 14, cursor: "pointer" }}>
                        <input type="checkbox" checked={odabraniSportovi.includes(sport.ID_sporta)} onChange={() => handleSportToggle(sport.ID_sporta)} />
                        {sport.Naziv_sporta}
                      </label>
                    ))}
                  </div>
                </div>
                <div><label style={{ fontSize: 13, fontWeight: 600 }}>Opis</label><textarea value={objektData.opis} onChange={(e) => setObjektData({ ...objektData, opis: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15, minHeight: 80 }} /></div>

                {/* ← IZMJENA: polje za URL slike */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>URL slike</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={objektData.slikaUrl}
                    onChange={(e) => setObjektData({ ...objektData, slikaUrl: e.target.value })}
                    style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15 }}
                  />
                  {/* ← IZMJENA: preview slike */}
                  {objektData.slikaUrl && (
                    <img
                      src={objektData.slikaUrl}
                      alt="Preview"
                      style={{ marginTop: 8, width: "100%", height: 140, objectFit: "cover", borderRadius: 10, border: "1px solid #E5E7EB" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>

                {objektPoruka && <div style={{ padding: 12, borderRadius: 10, background: "#FEE2E2", color: "#DC2626" }}>{objektPoruka}</div>}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={zatvoriObjektModal} style={{ flex: 1, padding: 14, borderRadius: 10, background: "#fff", border: "1.5px solid #E5E7EB", cursor: "pointer" }}>Odustani</button>
                  <button onClick={spremiObjekt} disabled={objektSpremanje} style={{ flex: 1, padding: 14, borderRadius: 10, background: objektSpremanje ? "#93C5FD" : "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", color: "#fff", border: "none", cursor: objektSpremanje ? "not-allowed" : "pointer" }}>{objektSpremanje ? "Spremam..." : "Spremi"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}