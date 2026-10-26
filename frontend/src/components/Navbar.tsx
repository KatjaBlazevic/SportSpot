import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobMenuOtvoren, setMobMenuOtvoren] = useState(false);
  const [mobSearchOtvoren, setMobSearchOtvoren] = useState(false);

  const navigate = useNavigate();
  const { korisnik, odjava } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobSearchOtvoren(false);
      setMobMenuOtvoren(false);
    }
  };

  const handleOdjava = () => {
    odjava();
    navigate("/");
    setMobMenuOtvoren(false);
  };

  const searchInputClass =
    "w-full rounded-full border border-border-default " +
    "bg-surface-soft py-2.5 pr-4 pl-[42px] " +
    "text-sm text-text-primary outline-none transition-all " +
    "placeholder:text-text-muted " +
    "focus:border-primary-light focus:bg-surface " +
    "focus:ring-3 focus:ring-primary-light/10";

  return (
    <nav className="sticky top-0 z-[100] border-b border-primary-border bg-surface shadow-sport-card">
      {/* Glavna navbar traka */}
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 no-underline">
          <div className="bg-brand-gradient flex size-9 items-center justify-center rounded-[10px]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
                fill="currentColor"
                className="text-text-inverse"
              />
            </svg>
          </div>

          <span className="text-[22px] font-extrabold tracking-tight text-primary">
            SportSpot
          </span>
        </Link>

        {/* Search bar - desktop */}
        <form onSubmit={handleSearch} className="navbar-search-wrapper">
          <div className="relative flex items-center">
            <svg
              className="pointer-events-none absolute left-3.5 shrink-0 text-text-muted"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              placeholder="Pretraži terene..."
              aria-label="Pretraži terene"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={searchInputClass}
            />
          </div>
        </form>

        {/* Desna strana */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Mobilna ikona pretrage */}
          <button
            type="button"
            className="navbar-mob-search size-10 shrink-0 cursor-pointer rounded-full border border-border-default bg-surface text-text-secondary"
            onClick={() => setMobSearchOtvoren(!mobSearchOtvoren)}
            aria-label="Pretraži"
            aria-expanded={mobSearchOtvoren}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Hamburger gumb */}
          <button
            type="button"
            className="navbar-hamburger"
            onClick={() => setMobMenuOtvoren(!mobMenuOtvoren)}
            aria-label="Izbornik"
            aria-expanded={mobMenuOtvoren}
          >
            {mobMenuOtvoren ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* Pomoć i autentikacija */}
          <div
            className={
              mobMenuOtvoren
                ? "navbar-auth-gumbi mob-menu-otvoren"
                : "navbar-auth-gumbi"
            }
          >
            {/* Pomoć */}
            <a
              href="/sportspot-pomoc.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pomoć"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-lg font-bold text-text-secondary no-underline transition-colors hover:bg-surface-soft"
            >
              ?
            </a>

            {korisnik ? (
              <>
                {/* Korisnički profil */}
                <Link
                  to="/profil"
                  onClick={() => setMobMenuOtvoren(false)}
                  className="flex items-center gap-2 rounded-full border border-border-default bg-surface-soft px-3 py-1.5 no-underline transition-colors hover:bg-primary-soft"
                >
                  <div className="bg-brand-gradient flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-text-inverse">
                    {korisnik.ime.charAt(0).toUpperCase()}
                  </div>

                  <span className="text-sm font-semibold text-text-primary">
                    {korisnik.ime}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleOdjava}
                  className="cursor-pointer rounded-full border border-border-default bg-transparent px-[18px] py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-soft"
                >
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                {/* Prijava */}
                <Link
                  to="/prijava"
                  onClick={() => setMobMenuOtvoren(false)}
                  className="btn-secondary rounded-full px-[18px] py-2 text-sm font-semibold no-underline"
                >
                  Prijavi se
                </Link>

                {/* Registracija */}
                <Link
                  to="/registracija"
                  onClick={() => setMobMenuOtvoren(false)}
                  className="bg-brand-gradient rounded-full px-[18px] py-2 text-sm font-semibold text-text-inverse no-underline shadow-sport-primary transition-opacity hover:opacity-90"
                >
                  Registriraj se
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobilna search traka */}
      {mobSearchOtvoren && (
        <div className="border-t border-border-light bg-surface px-4 pt-2 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-3.5 text-text-muted"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                type="text"
                placeholder="Pretraži terene..."
                aria-label="Pretraži terene"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`${searchInputClass} border-primary-light bg-surface ring-3 ring-primary-light/10`}
              />
            </div>
          </form>
        </div>
      )}
    </nav>
  );
}
