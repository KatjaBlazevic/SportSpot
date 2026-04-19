import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E8EEFF",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(37,99,235,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
                fill="white"
              />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "'DM Sans', 'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: "#1D4ED8",
              letterSpacing: "-0.5px",
            }}
          >
            SportSpot
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, maxWidth: 480, margin: "0 auto" }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              style={{
                position: "absolute",
                left: 14,
                color: "#9CA3AF",
                flexShrink: 0,
              }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Pretraži terene..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 42px",
                borderRadius: 999,
                border: "1.5px solid #E5E7EB",
                background: "#F9FAFB",
                fontSize: 14,
                fontFamily: "inherit",
                color: "#111827",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
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
        </form>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Notification bell */}
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid #E5E7EB",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6B7280",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6";
              (e.currentTarget as HTMLButtonElement).style.color = "#3B82F6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
              (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Auth buttons */}
          <Link
            to="/prijava"
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: "1.5px solid #1D4ED8",
              color: "#1D4ED8",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "background 0.2s, color 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#EFF6FF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            Prijavi se
          </Link>
          <Link
            to="/registracija"
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "opacity 0.2s, transform 0.1s",
              boxShadow: "0 2px 8px rgba(29,78,216,0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Registriraj se
          </Link>
        </div>
      </div>
    </nav>
  );
}