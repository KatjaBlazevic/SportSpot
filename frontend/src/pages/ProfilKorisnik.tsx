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

export default function ProfilKorisnik() {
  const { korisnik, token, ucitavanje, osvjezi } = useAuth();
  const navigate = useNavigate();
  const [omiljeni, setOmiljeni] = useState<OmiljeniObjekt[]>(() => {
    const saved = localStorage.getItem("sportspot_omiljeni");
    if (saved) { try { return JSON.parse(saved); } catch { return []; } }
    return [];
  });
  const [rezervacije, setRezervacije] = useState<Rezervacija[]>([]);
  const [aktivnaTab, setAktivnaTab] = useState<"rezervacije" | "omiljeni">("rezervacije");
  const [ucitavanjeRez, setUcitavanjeRez] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [spremanje, setSpremanje] = useState(false);
  const [poruka, setPoruka] = useState("");
  interface EditData { ime: string; prezime: string; email: string; brojMobitela: string; novaLozinka: string; potvrdaLozinke: string; }
  const [editData, setEditData] = useState<EditData>({ ime: "", prezime: "", email: "", brojMobitela: "", novaLozinka: "", potvrdaLozinke: "" });

  useEffect(() => { if (!ucitavanje && !korisnik) navigate("/prijava"); }, [ucitavanje, korisnik, navigate]);

  useEffect(() => {
    if (aktivnaTab === "rezervacije" && token) {
      (async () => {
        setUcitavanjeRez(true);
        try {
          const res = await fetch("https://sportspot-sxcq.onrender.com/api/korisnik/moje-rezervacije", { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error("API error");
          const data = await res.json();
          setRezervacije(data || []);
        } catch {
          // handle error
        } finally {
          setUcitavanjeRez(false);
        }
      })();
    }
  }, [aktivnaTab, token]);

  const otvoriModal = async () => {
    try {
      const res = await fetch("https://sportspot-sxcq.onrender.com/api/korisnik/profil", { headers: { Authorization: `Bearer ${token}` } });
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
    setSpremanje(true); setPoruka("");
    try {
      const res = await fetch("https://sportspot-sxcq.onrender.com/api/korisnik/profil/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ime: editData.ime, prezime: editData.prezime, email: editData.email, brojMobitela: editData.brojMobitela || null, novaLozinka: editData.novaLozinka || null }),
      });
      const data = await res.json();
      if (res.ok) { osvjezi({ ...korisnik!, ime: editData.ime, prezime: editData.prezime, email: editData.email }); setShowModal(false); }
      else { setPoruka(data.greska || "Greška pri spremanju."); }
    } catch { setPoruka("Greška sa serverom."); }
    finally { setSpremanje(false); }
  };

  const ukloniOmiljeni = (id: number) => { const novi = omiljeni.filter((o) => o.id !== id); setOmiljeni(novi); localStorage.setItem("sportspot_omiljeni", JSON.stringify(novi)); };
  const formatirajDatum = (datum: string) => { const d = new Date(datum); const m = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"]; return `${d.getDate()}. ${m[d.getMonth()]} ${d.getFullYear()}.`; };
  const getStatusBoja = (status: string) => status === "Potvrđeno" ? { bg: "#D1FAE5", color: "#059669" } : status === "Odbijeno" ? { bg: "#FEE2E2", color: "#DC2626" } : { bg: "#FEF3C7", color: "#D97706" };

  if (ucitavanje || !korisnik) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#F5F7FA", padding: "16px 12px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <div style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", borderRadius: 24, padding: 32, marginBottom: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 100, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#1D4ED8", flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              {korisnik.ime.charAt(0)}{korisnik.prezime.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{korisnik.ime} {korisnik.prezime}</h1>
              <p style={{ fontSize: 13, margin: "6px 0 0", opacity: 0.9 }}>{korisnik.email}</p>
            </div>
            <button onClick={otvoriModal} style={{ padding: "10px 16px", borderRadius: 12, background: "#fff", color: "#1D4ED8", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", flexShrink: 0 }}>
              Uredi profil
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setAktivnaTab("rezervacije")} style={{ padding: "14px 24px", borderRadius: 14, background: aktivnaTab === "rezervacije" ? "#1D4ED8" : "#fff", color: aktivnaTab === "rezervacije" ? "#fff" : "#374151", fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            📅 Moje rezervacije
          </button>
          <button onClick={() => setAktivnaTab("omiljeni")} style={{ padding: "14px 24px", borderRadius: 14, background: aktivnaTab === "omiljeni" ? "#1D4ED8" : "#fff", color: aktivnaTab === "omiljeni" ? "#fff" : "#374151", fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            ❤️ Omiljeni {omiljeni.length > 0 && (
              <span style={{ marginLeft: 4, padding: "2px 8px", borderRadius: 10, background: aktivnaTab === "omiljeni" ? "rgba(255,255,255,0.2)" : "#FEE2E2", fontSize: 12, color: aktivnaTab === "omiljeni" ? "#fff" : "#EF4444" }}>{omiljeni.length}</span>
            )}
          </button>
        </div>

        {aktivnaTab === "rezervacije" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>📅 Moje rezervacije</h2>
            {ucitavanjeRez ? (
              <p style={{ color: "#6B7280", textAlign: "center", padding: 40 }}>Učitavam...</p>
            ) : rezervacije.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                <p style={{ fontSize: 16 }}>Nemate niti jednu rezervaciju.</p>
                <Link to="/" style={{ color: "#1D4ED8", fontWeight: 600, marginTop: 12, display: "inline-block" }}>Pronađi teren →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {rezervacije.map((rez) => {
                  const statusStil = getStatusBoja(rez.Status);
                  return (
                    <div key={rez.ID_termina} style={{ padding: 20, borderRadius: 16, border: "1px solid #E5E7EB" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Link to={`/objekt/${rez.ID_objekta}`} style={{ textDecoration: "none", flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 4 }}>{rez.Naziv_objekta}</div>
                          <div style={{ fontSize: 14, color: "#6B7280" }}>{rez.Adresa}</div>
                          {rez.Naziv_kluba && <div style={{ fontSize: 13, color: "#1D4ED8", marginTop: 4 }}>🏟️ {rez.Naziv_kluba}</div>}
                        </Link>
                        <span style={{ padding: "6px 12px", borderRadius: 8, background: statusStil.bg, color: statusStil.color, fontSize: 12, fontWeight: 700 }}>{rez.Status}</span>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", gap: 10, fontSize: 13, color: "#374151", flexWrap: "wrap" }}>
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

        {aktivnaTab === "omiljeni" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>❤️ Omiljeni objekti</h2>
            {omiljeni.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
                <p style={{ fontSize: 16 }}>Nemate omiljenih objekata.</p>
                <Link to="/" style={{ color: "#1D4ED8", fontWeight: 600, marginTop: 12, display: "inline-block" }}>Pronađi teren →</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {omiljeni.map((obj) => (
                  <div key={obj.id} style={{ padding: 20, borderRadius: 16, border: "1px solid #E5E7EB", position: "relative" }}>
                    <Link to={`/objekt/${obj.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 6 }}>{obj.naziv}</div>
                      <div style={{ fontSize: 14, color: "#6B7280" }}>{obj.adresa}</div>
                    </Link>
                    <button onClick={() => ukloniOmiljeni(obj.id)} style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: "50%", border: "1px solid #FEE2E2", background: "#FEF2F2", color: "#EF4444", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "90%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Uredi profil</h2>
                <button onClick={zatvoriModal} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[{ label: "Ime", key: "ime" as const }, { label: "Prezime", key: "prezime" as const }, { label: "Email", key: "email" as const }].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                    <input type={f.key === "email" ? "email" : "text"} value={editData[f.key]} onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Broj mobitela <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(nije obavezno)</span></label>
                  <input type="tel" value={editData.brojMobitela} onChange={(e) => setEditData({ ...editData, brojMobitela: e.target.value })} placeholder="+385 91 234 5678" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16, marginTop: 8 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nova lozinka <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(ostavi prazno ako ne mijenjaš)</span></label>
                  <input type="password" value={editData.novaLozinka} onChange={(e) => setEditData({ ...editData, novaLozinka: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }} />
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Potvrdi lozinku</label>
                  <input type="password" value={editData.potvrdaLozinke} onChange={(e) => setEditData({ ...editData, potvrdaLozinke: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 15, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                {poruka && <div style={{ padding: "12px 14px", borderRadius: 10, background: poruka.includes("uspješno") ? "#D1FAE5" : "#FEE2E2", color: poruka.includes("uspješno") ? "#059669" : "#DC2626", fontSize: 14, fontWeight: 600 }}>{poruka}</div>}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={zatvoriModal} style={{ flex: 1, padding: "14px", borderRadius: 10, background: "#fff", color: "#374151", fontWeight: 600, fontSize: 15, border: "1.5px solid #E5E7EB", cursor: "pointer", fontFamily: "inherit" }}>Odustani</button>
                  <button onClick={spremiPromjene} disabled={spremanje} style={{ flex: 1, padding: "14px", borderRadius: 10, background: spremanje ? "#93C5FD" : "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: spremanje ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{spremanje ? "Spremam..." : "Spremi"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}