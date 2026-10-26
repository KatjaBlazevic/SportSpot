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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [rezervacije, setRezervacije] = useState<Rezervacija[]>([]);
  const [aktivnaTab, setAktivnaTab] = useState<"rezervacije" | "omiljeni">(
    "rezervacije",
  );
  const [ucitavanjeRez, setUcitavanjeRez] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [spremanje, setSpremanje] = useState(false);
  const [poruka, setPoruka] = useState("");
  interface EditData {
    ime: string;
    prezime: string;
    email: string;
    brojMobitela: string;
    novaLozinka: string;
    potvrdaLozinke: string;
  }
  const [editData, setEditData] = useState<EditData>({
    ime: "",
    prezime: "",
    email: "",
    brojMobitela: "",
    novaLozinka: "",
    potvrdaLozinke: "",
  });

  useEffect(() => {
    if (!ucitavanje && !korisnik) navigate("/prijava");
  }, [ucitavanje, korisnik, navigate]);

  useEffect(() => {
    if (aktivnaTab === "rezervacije" && token) {
      (async () => {
        setUcitavanjeRez(true);
        try {
          const res = await fetch(
            "http://localhost:5000/api/korisnik/moje-rezervacije",
            { headers: { Authorization: `Bearer ${token}` } },
          );
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
      const res = await fetch("http://localhost:5000/api/korisnik/profil", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEditData({
        ime: data.ime || korisnik?.ime || "",
        prezime: data.prezime || korisnik?.prezime || "",
        email: data.email || korisnik?.email || "",
        brojMobitela: data.brojMobitela || "",
        novaLozinka: "",
        potvrdaLozinke: "",
      });
    } catch {
      setEditData({
        ime: korisnik?.ime || "",
        prezime: korisnik?.prezime || "",
        email: korisnik?.email || "",
        brojMobitela: "",
        novaLozinka: "",
        potvrdaLozinke: "",
      });
    }
    setPoruka("");
    setShowModal(true);
  };

  const zatvoriModal = () => {
    setShowModal(false);
    setPoruka("");
  };

  const spremiPromjene = async () => {
    if (
      editData.novaLozinka &&
      editData.novaLozinka !== editData.potvrdaLozinke
    ) {
      setPoruka("Lozinke se ne podudaraju.");
      return;
    }
    setSpremanje(true);
    setPoruka("");
    try {
      const res = await fetch(
        "http://localhost:5000/api/korisnik/profil/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ime: editData.ime,
            prezime: editData.prezime,
            email: editData.email,
            brojMobitela: editData.brojMobitela || null,
            novaLozinka: editData.novaLozinka || null,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        osvjezi({
          ...korisnik!,
          ime: editData.ime,
          prezime: editData.prezime,
          email: editData.email,
        });
        setShowModal(false);
      } else {
        setPoruka(data.greska || "Greška pri spremanju.");
      }
    } catch {
      setPoruka("Greška sa serverom.");
    } finally {
      setSpremanje(false);
    }
  };

  const ukloniOmiljeni = (id: number) => {
    const novi = omiljeni.filter((o) => o.id !== id);
    setOmiljeni(novi);
    localStorage.setItem("sportspot_omiljeni", JSON.stringify(novi));
  };
  const formatirajDatum = (datum: string) => {
    const d = new Date(datum);
    const m = [
      "sij",
      "velj",
      "ožu",
      "tra",
      "svi",
      "lip",
      "srp",
      "kol",
      "ruj",
      "lis",
      "stu",
      "pro",
    ];
    return `${d.getDate()}. ${m[d.getMonth()]} ${d.getFullYear()}.`;
  };

  if (ucitavanje || !korisnik) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-3 py-4">
      <div className="mx-auto max-w-225">
        <div className="bg-brand-gradient relative mb-6 overflow-hidden rounded-panel p-8 text-text-inverse">
          <div className="absolute -top-[50px] -right-[50px] size-[200px] rounded-full bg-surface/10" />
          <div className="absolute -bottom-[30px] right-[100px] size-[100px] rounded-full bg-surface/5" />

          <div className="relative z-1 flex flex-wrap items-center gap-4">
            <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-surface text-[28px] font-extrabold text-primary shadow-sport-elevated">
              {korisnik.ime.charAt(0)}
              {korisnik.prezime.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold text-text-inverse">
                {korisnik.ime} {korisnik.prezime}
              </h1>

              <p className="mt-1.5 break-all text-[13px] text-text-inverse/90">
                {korisnik.email}
              </p>
            </div>

            <button
              type="button"
              onClick={otvoriModal}
              className="shrink-0 cursor-pointer rounded-control bg-surface px-4 py-2.5 text-[13px] font-bold text-primary shadow-sport-elevated transition-colors hover:bg-primary-soft"
            >
              Uredi profil
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAktivnaTab("rezervacije")}
            className={`cursor-pointer rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-colors ${
              aktivnaTab === "rezervacije"
                ? "bg-primary text-text-inverse"
                : "bg-surface text-text-primary hover:bg-primary-soft"
            }`}
          >
            📅 Moje rezervacije
          </button>

          <button
            type="button"
            onClick={() => setAktivnaTab("omiljeni")}
            className={`cursor-pointer rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-colors ${
              aktivnaTab === "omiljeni"
                ? "bg-primary text-text-inverse"
                : "bg-surface text-text-primary hover:bg-primary-soft"
            }`}
          >
            ❤️ Omiljeni
            {omiljeni.length > 0 && (
              <span
                className={`ml-1 rounded-[10px] px-2 py-0.5 text-xs ${
                  aktivnaTab === "omiljeni"
                    ? "bg-surface/20 text-text-inverse"
                    : "bg-danger-soft text-danger"
                }`}
              >
                {omiljeni.length}
              </span>
            )}
          </button>
        </div>

        {aktivnaTab === "rezervacije" && (
          <div className="rounded-[20px] bg-surface p-7 shadow-sport-card">
            <h2 className="mb-5 text-card-heading text-text-primary">
              📅 Moje rezervacije
            </h2>

            {ucitavanjeRez ? (
              <p className="p-10 text-center text-text-secondary">
                Učitavam...
              </p>
            ) : rezervacije.length === 0 ? (
              <div className="p-10 text-center text-text-muted">
                <div className="mb-3 text-5xl">📅</div>
                <p className="text-body">Nemate niti jednu rezervaciju.</p>
                <Link
                  to="/"
                  className="mt-3 inline-block font-semibold text-primary hover:text-primary-hover"
                >
                  Pronađi teren →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {rezervacije.map((rez) => (
                  <div
                    key={rez.ID_termina}
                    className="rounded-card border border-border-default p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/objekt/${rez.ID_objekta}`}
                        className="min-w-0 flex-1 no-underline"
                      >
                        <div className="mb-1 text-[17px] font-bold text-text-primary">
                          {rez.Naziv_objekta}
                        </div>

                        <div className="text-body-sm text-text-secondary">
                          {rez.Adresa}
                        </div>

                        {rez.Naziv_kluba && (
                          <div className="mt-1 text-[13px] text-primary">
                            🏟️ {rez.Naziv_kluba}
                          </div>
                        )}
                      </Link>

                      <span
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                          rez.Status === "Potvrđeno"
                            ? "badge-success"
                            : rez.Status === "Odbijeno"
                              ? "badge-danger"
                              : "badge-warning"
                        }`}
                      >
                        {rez.Status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2.5 text-[13px] text-text-secondary">
                      <span>📆 {formatirajDatum(rez.Datum)}</span>

                      <span>
                        ⏰ {rez.vrijeme_pocetka} - {rez.vrijeme_kraja}
                      </span>

                      <span className="font-bold text-primary">
                        {rez.Cijena} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aktivnaTab === "omiljeni" && (
          <div className="rounded-[20px] bg-surface p-7 shadow-sport-card">
            <h2 className="mb-5 text-card-heading text-text-primary">
              ❤️ Omiljeni objekti
            </h2>

            {omiljeni.length === 0 ? (
              <div className="p-10 text-center text-text-muted">
                <div className="mb-3 text-5xl">❤️</div>

                <p className="text-body">Nemate omiljenih objekata.</p>

                <Link
                  to="/"
                  className="mt-3 inline-block font-semibold text-primary hover:text-primary-hover"
                >
                  Pronađi teren →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3.5">
                {omiljeni.map((obj) => (
                  <div
                    key={obj.id}
                    className="relative rounded-card border border-border-default p-5 transition-colors hover:border-primary-border"
                  >
                    <Link
                      to={`/objekt/${obj.id}`}
                      className="block pr-6 no-underline"
                    >
                      <div className="mb-1.5 text-subsection-heading text-text-primary">
                        {obj.naziv}
                      </div>

                      <div className="text-body-sm text-text-secondary">
                        {obj.adresa}
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => ukloniOmiljeni(obj.id)}
                      aria-label={`Ukloni ${obj.naziv} iz omiljenih`}
                      title="Ukloni iz omiljenih"
                      className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-full border border-danger-border bg-danger-soft text-sm text-danger transition-colors hover:bg-danger-soft/70"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text-primary/50 p-4">
            <div className="sport-modal max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[20px] p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[22px] font-extrabold text-text-primary">
                  Uredi profil
                </h2>

                <button
                  type="button"
                  onClick={zatvoriModal}
                  aria-label="Zatvori uređivanje profila"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-lg text-text-secondary hover:bg-surface-soft"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: "Ime", key: "ime" as const },
                  { label: "Prezime", key: "prezime" as const },
                  { label: "Email", key: "email" as const },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="sport-label mb-1.5 text-[13px]">
                      {field.label}
                    </label>

                    <input
                      type={field.key === "email" ? "email" : "text"}
                      value={editData[field.key]}
                      onChange={(event) =>
                        setEditData({
                          ...editData,
                          [field.key]: event.target.value,
                        })
                      }
                      aria-label={field.label}
                      className="sport-input text-[15px]"
                    />
                  </div>
                ))}

                <div>
                  <label className="sport-label mb-1.5 text-[13px]">
                    Broj mobitela
                    <span className="ml-1 font-normal text-text-muted">
                      (nije obavezno)
                    </span>
                  </label>

                  <input
                    type="tel"
                    value={editData.brojMobitela}
                    onChange={(event) =>
                      setEditData({
                        ...editData,
                        brojMobitela: event.target.value,
                      })
                    }
                    placeholder="+385 91 234 5678"
                    aria-label="Broj mobitela"
                    className="sport-input text-[15px]"
                  />
                </div>

                <div className="mt-2 border-t border-border-default pt-4">
                  <label className="sport-label mb-1.5 text-[13px]">
                    Nova lozinka
                    <span className="ml-1 font-normal text-text-muted">
                      (ostavi prazno ako ne mijenjaš)
                    </span>
                  </label>

                  <input
                    type="password"
                    value={editData.novaLozinka}
                    onChange={(event) =>
                      setEditData({
                        ...editData,
                        novaLozinka: event.target.value,
                      })
                    }
                    aria-label="Nova lozinka"
                    className="sport-input mb-3 text-[15px]"
                  />

                  <label className="sport-label mb-1.5 text-[13px]">
                    Potvrdi lozinku
                  </label>

                  <input
                    type="password"
                    value={editData.potvrdaLozinke}
                    onChange={(event) =>
                      setEditData({
                        ...editData,
                        potvrdaLozinke: event.target.value,
                      })
                    }
                    aria-label="Potvrdi lozinku"
                    className="sport-input text-[15px]"
                  />
                </div>

                {poruka && (
                  <div
                    role="alert"
                    className={`rounded-control px-3.5 py-3 text-sm font-semibold ${
                      poruka.includes("uspješno")
                        ? "badge-success"
                        : "badge-danger"
                    }`}
                  >
                    {poruka}
                  </div>
                )}

                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={zatvoriModal}
                    className="btn-secondary flex-1 px-4 py-3.5 text-[15px]"
                  >
                    Odustani
                  </button>

                  <button
                    type="button"
                    onClick={spremiPromjene}
                    disabled={spremanje}
                    className="btn-primary bg-brand-gradient flex-1 px-4 py-3.5 text-[15px]"
                  >
                    {spremanje ? "Spremam..." : "Spremi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
