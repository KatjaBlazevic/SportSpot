import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { DetaljiObjekta } from "../types/index.ts";
import InfoSekcija from "../components/InfoSekcija";
import TerminKartica from "../components/TerminKartica";
import FacilityReviews from "../components/FacilityDetails/FacilityReviews";
import NovaRecenzijaObrazac from "../components/NovaRecenzijaObrazac.tsx";
import NoviTerminObrazac from "../components/NoviTerminObrazac.tsx";
import TjedniFilter from "../components/TjedniFilter.tsx";
import FacilityHeader from "../components/FacilityDetails/FacilityHeader";

export default function ObjektDetalji() {
  const { id } = useParams<{ id: string }>();
  const { korisnik } = useAuth();
  const [data, setData] = useState<DetaljiObjekta | null>(null);
  const [isObrazacOpen, setIsObrazacOpen] = useState(false);
  const [isTerminObrazacOpen, setIsTerminObrazacOpen] = useState(false);
  const [raspon, setRaspon] = useState<{ start: Date; end: Date } | null>(null);
  const [omiljen, setOmiljen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sportspot_omiljeni");
    if (saved && id) {
      const omiljeni = JSON.parse(saved) as { id: number }[];
      return omiljeni.some((o) => o.id === Number(id));
    }
    return false;
  });

  const dohvatiPodatke = useCallback(() => {
    fetch(`http://localhost:5000/api/objekti/${id}`)
      .then((res) => res.json())
      .then((json: DetaljiObjekta) => {
        setData(json);
      })
      .catch((err) => console.error("Greška:", err));
  }, [id]);

  const toggleOmiljeni = () => {
    if (!korisnik) return;
    const saved = localStorage.getItem("sportspot_omiljeni");
    let omiljeni = saved ? JSON.parse(saved) : [];
    if (omiljen) {
      omiljeni = omiljeni.filter((o: { id: number }) => o.id !== Number(id));
    } else {
      omiljeni.push({
        id: Number(id),
        naziv: data?.naziv || "",
        adresa: data?.adresa || "",
      });
    }
    localStorage.setItem("sportspot_omiljeni", JSON.stringify(omiljeni));
    setOmiljen(!omiljen);
  };

  const handleRecenzijaSubmit = async (ocjena: number, komentar: string) => {
    try {
      const token = localStorage.getItem("sportspot_token");

      if (!token) {
        alert("Moraš biti prijavljen da bi ostavio recenziju!");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/objekti/recenzije/nova",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idObjekta: data?.id,
            ocjena: ocjena,
            komentar: komentar,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("WOOHOO! Recenzija je objavljena.");
        setIsObrazacOpen(false);
        window.location.reload();
      } else {
        alert(result.error || "Došlo je do pogreške.");
      }
    } catch (error) {
      console.error("Greška pri slanju recenzije:", error);
      alert("Server nije dostupan.");
    }
  };

  const napustiListuCekanja = async (idTermina: number) => {
    try {
      const token = localStorage.getItem("sportspot_token");
      const res = await fetch(
        `http://localhost:5000/api/termini/lista-cekanja/odustani/${idTermina}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        dohvatiPodatke();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Greška pri odustajanju.");
      }
    } catch (err) {
      console.error("Greška:", err);
      alert("Server nije dostupan.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTerminSubmit = async (terminData: any) => {
    try {
      const token = localStorage.getItem("sportspot_token");
      const response = await fetch("http://localhost:5000/api/termini/dodaj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...terminData,
          idObjekta: data?.id,
        }),
      });

      if (response.ok) {
        alert("Termini uspješno dodani!");
        setIsTerminObrazacOpen(false);
        window.location.reload();
      } else {
        const res = await response.json();
        alert(res.error || "Greška pri dodavanju termina.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    dohvatiPodatke();
  }, [dohvatiPodatke]);

  const handleWeekChange = (start: Date, end: Date) => {
    setRaspon({ start, end });
  };

  const filtriraniTermini = useMemo(() => {
    if (!data?.termini || !raspon) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.termini.filter((t: any) => {
      const datumTermina = new Date(t.datum).toLocaleDateString("sv-SE");
      const startStr = raspon.start.toLocaleDateString("sv-SE");
      const endStr = raspon.end.toLocaleDateString("sv-SE");
      return datumTermina >= startStr && datumTermina <= endStr;
    });
  }, [data, raspon]);

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-tighter">
        Učitavanje...
      </div>
    );

  const jeVlasnik =
    korisnik?.uloga === "Vlasnik" &&
    Number(korisnik.id) === Number(data.idKorisnika);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <FacilityHeader
          name={data.naziv}
          sports={data.sportovi}
          isAuthenticated={Boolean(korisnik)}
          isFavorite={omiljen}
          onToggleFavorite={toggleOmiljeni}
        />

        {/* Glavni grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 mb-12">
          {/* InfoSekcija - desno na desktopu, prvo na mobitelu */}
          <div className="lg:col-span-1 lg:col-start-2 lg:row-start-1 space-y-8">
            <InfoSekcija
              slikaUrl={data.slikaUrl || ""}
              adresa={data.adresa}
              kvart={data.kvart}
              kapacitet={data.kapacitet}
              klub={data.nazivKluba}
              opis={data.opis}
              lat={data.lat}
              lng={data.lng}
              naziv={data.naziv}
              sportovi={data.sportovi}
            />
          </div>

          {/* Termini - lijevo na desktopu */}
          <div className="lg:col-span-1 lg:row-span-2 lg:col-start-1">
            <div className="bg-white p-4 sm:p-8 rounded-[32px] border border-blue-50 shadow-xl shadow-blue-900/5">
              <div
                className={`flex p-4 items-center transition-colors m-[0_auto] mb-6 ${
                  jeVlasnik
                    ? "justify-between bg-white w-full sm:w-[90%]"
                    : "w-full justify-center"
                }`}
              >
                <h3 className="text-base font-black text-center text-blue-400 uppercase tracking-[0.2em]">
                  Termini
                </h3>
                {jeVlasnik && (
                  <button
                    onClick={() => setIsTerminObrazacOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                  >
                    <span>Dodaj</span>
                    <span className="text-lg">+</span>
                  </button>
                )}
              </div>
              <TjedniFilter onWeekChange={handleWeekChange} />
              <div className="space-y-3">
                {filtriraniTermini.length > 0 ? (
                  [...filtriraniTermini]
                    .sort((a, b) => {
                      const datumA = new Date(a.datum).getTime();
                      const datumB = new Date(b.datum).getTime();
                      if (datumA !== datumB) return datumA - datumB;
                      return a.vrijemePocetka.localeCompare(b.vrijemePocetka);
                    })
                    .map((t) => {
                      const jeMojTermin = !!(
                        t.status !== "Slobodan" &&
                        korisnik?.id &&
                        Number(t.idKorisnika) === Number(korisnik.id)
                      );
                      const listaIds = t.lista_ids || [];
                      const indexNaListi = listaIds.indexOf(
                        korisnik?.id ? Number(korisnik.id) : -1,
                      );
                      const jeNaListi = indexNaListi !== -1;
                      const redniBroj = indexNaListi + 1;

                      return (
                        <div key={t.id} className="relative">
                          <TerminKartica
                            id={t.id}
                            idKorisnika={t.idKorisnika}
                            datum={t.datum}
                            vrijemePocetka={t.vrijemePocetka}
                            vrijemeKraja={t.vrijemeKraja}
                            cijena={t.cijena}
                            status={t.status}
                            onRezervacija={dohvatiPodatke}
                            jeMojTermin={jeMojTermin}
                            jeVlasnikObjekta={jeVlasnik}
                            lista_ids={t.lista_ids}
                          />

                          {t.status !== "Slobodan" &&
                            korisnik &&
                            !jeMojTermin &&
                            !jeVlasnik && (
                              <div className="mt-2 w-full">
                                {jeNaListi ? (
                                  <div className="flex flex-row items-center gap-2 w-full">
                                    <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-50 border border-amber-200 rounded-xl shadow-inner">
                                      <span className="text-amber-800 text-[10px] font-black uppercase tracking-tight">
                                        {redniBroj}. na listi čekanja
                                      </span>
                                    </div>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (
                                          window.confirm(
                                            "Želiš li se maknuti s liste čekanja?",
                                          )
                                        ) {
                                          await napustiListuCekanja(t.id);
                                        }
                                      }}
                                      className="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl transition-all whitespace-nowrap"
                                    >
                                      Otkaži
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const token =
                                          localStorage.getItem(
                                            "sportspot_token",
                                          );
                                        const res = await fetch(
                                          "http://localhost:5000/api/termini/lista-cekanja/prijava",
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                              Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({
                                              idTermina: t.id,
                                            }),
                                          },
                                        );

                                        if (res.ok) {
                                          dohvatiPodatke();
                                        } else {
                                          const errorData = await res.json();
                                          alert(
                                            errorData.error ||
                                              "Greška pri prijavi.",
                                          );
                                        }
                                      } catch (err) {
                                        console.error("Greška:", err);
                                        alert("Server nije dostupan.");
                                      }
                                    }}
                                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-amber-900/20"
                                  >
                                    Prijava na listu čekanja
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    })
                ) : (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm font-medium italic">
                      Nema termina ovaj tjedan
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FacilityReviews
            rating={data.ocjena}
            reviewCount={data.brojRecenzija}
            reviews={data.recenzije ?? []}
            isAuthenticated={Boolean(korisnik)}
            onAddReview={() => setIsObrazacOpen(true)}
          />
        </div>
      </main>

      <NovaRecenzijaObrazac
        isOpen={isObrazacOpen}
        onClose={() => setIsObrazacOpen(false)}
        onSubmit={handleRecenzijaSubmit}
        objektNaziv={data.naziv}
      />
      <NoviTerminObrazac
        isOpen={isTerminObrazacOpen}
        onClose={() => setIsTerminObrazacOpen(false)}
        onSubmit={handleTerminSubmit}
        objektNaziv={data.naziv}
      />
    </div>
  );
}
