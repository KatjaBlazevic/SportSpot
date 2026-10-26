import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AuthLayout from "../components/Auth/AuthLayout";

export default function Prijava() {
  const { prijava } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [greska, setGreska] = useState("");
  const [ucitavanje, setUcitavanje] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGreska("");
    setUcitavanje(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/prijava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lozinka }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.greska || "Greška pri prijavi.");
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

  return (
    <AuthLayout
      variant="login"
      title="Prijavi se"
      description="Dobrodošao nazad u SportSpot"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* Email */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Email adresa
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ime@primjer.com"
            style={{
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
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3B82F6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.boxShadow = "none";
              e.target.style.background = "#F9FAFB";
            }}
          />
        </div>

        {/* Lozinka */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Lozinka
          </label>
          <input
            type="password"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
            required
            placeholder="Unesite lozinku"
            style={{
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
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3B82F6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.boxShadow = "none";
              e.target.style.background = "#F9FAFB";
            }}
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
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
            transition: "opacity 0.2s, transform 0.1s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!ucitavanje)
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          }}
        >
          {ucitavanje ? "Prijavljujem..." : "Prijavi se"}
        </button>
      </form>

      {/* Footer link */}
      <p
        style={{
          textAlign: "center",
          marginTop: 24,
          fontSize: 14,
          color: "#6B7280",
        }}
      >
        Nemaš račun?{" "}
        <Link
          to="/registracija"
          style={{
            color: "#1D4ED8",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Registriraj se
        </Link>
      </p>
    </AuthLayout>
  );
}
