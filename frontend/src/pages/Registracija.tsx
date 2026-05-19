import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Registracija() {
  const { prijava } = useAuth();
  const navigate = useNavigate();

  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [potvrda, setPotvrda] = useState("");
  const [brojMobitela, setBrojMobitela] = useState("");
  const [greska, setGreska] = useState("");
  const [ucitavanje, setUcitavanje] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGreska("");

    if (lozinka !== potvrda) {
      setGreska("Lozinke se ne podudaraju.");
      return;
    }
    if (lozinka.length < 6) {
      setGreska("Lozinka mora imati najmanje 6 znakova.");
      return;
    }

    setUcitavanje(true);

    try {
      const res = await fetch("https://sportspot-sxcq.onrender.com/api/auth/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, prezime, email, lozinka, brojMobitela: brojMobitela || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.greska || "Greška pri registraciji.");
        return;
      }

      prijava(data.token, data.korisnik);
      navigate("/");
    } catch {
      setGreska("Nije moguće spojiti se na server.");
    } finally {
      setUcitavanje(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #E5E7EB",
    fontSize: 15,
    color: "#111827",
    background: "#F9FAFB",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#3B82F6";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
    e.target.style.background = "#fff";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E5E7EB";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#F9FAFB";
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F0F4FF",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 32px rgba(29,78,216,0.10)",
          padding: "48px 40px",
          width: "100%",
          maxWidth: 480,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#111827",
              margin: 0,
              fontFamily: "'DM Sans', 'Outfit', sans-serif",
            }}
          >
            Registriraj se
          </h1>
          <p style={{ color: "#6B7280", marginTop: 8, fontSize: 15 }}>
            Stvori svoj SportSpot račun i pridruži nam se!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ime + Prezime */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Ime
              </label>
              <input
                type="text"
                value={ime}
                onChange={(e) => setIme(e.target.value)}
                required
                placeholder="Marko"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Prezime
              </label>
              <input
                type="text"
                value={prezime}
                onChange={(e) => setPrezime(e.target.value)}
                required
                placeholder="Horvat"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Email adresa
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="marko@primjer.com"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Broj mobitela */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Broj mobitela{" "}
              <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(nije obavezno)</span>
            </label>
            <input
              type="tel"
              value={brojMobitela}
              onChange={(e) => setBrojMobitela(e.target.value)}
              placeholder="+385 91 234 5678"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Lozinka */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Lozinka
            </label>
            <input
              type="password"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
              required
              placeholder="Najmanje 6 znakova"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Potvrda lozinke */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Potvrda lozinke
            </label>
            <input
              type="password"
              value={potvrda}
              onChange={(e) => setPotvrda(e.target.value)}
              required
              placeholder="Ponovi lozinku"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Greška */}
          {greska && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#DC2626",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {greska}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={ucitavanje}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 10,
              background: ucitavanje
                ? "#93C5FD"
                : "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              cursor: ucitavanje ? "not-allowed" : "pointer",
              boxShadow: "0 2px 10px rgba(29,78,216,0.25)",
              transition: "opacity 0.2s",
              fontFamily: "inherit",
              marginTop: 4,
            }}
            onMouseEnter={(e) => {
              if (!ucitavanje) (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {ucitavanje ? "Registriram..." : "Registriraj se"}
          </button>
        </form>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#6B7280" }}>
          Već imaš račun?{" "}
          <Link
            to="/prijava"
            style={{ color: "#1D4ED8", fontWeight: 600, textDecoration: "none" }}
          >
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  );
}
