import { useEffect, useRef } from "react";
import type { InfoSekcijaProps } from "../types";

interface ProširenaInfoSekcijaProps extends InfoSekcijaProps {
  slikaUrl?: string;
  lat?: number | null;
  lng?: number | null;
  naziv?: string;
  sportovi?: string[];
}

const sportIkone: Record<string, string> = {
  Tenis: "🎾", Padel: "🏓", Nogomet: "⚽",
  "Mali nogomet": "⚽", Košarka: "🏀",
  Odbojka: "🏐", Plivanje: "🏊", Vaterpolo: "🤽",
};

function MiniMapa({ lat, lng, naziv, sport }: { lat: number; lng: number; naziv: string; sport: string }) {
  const mapaRef = useRef<HTMLDivElement>(null);
  const ikona = sportIkone[sport] ?? "🏟️";

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L || !mapaRef.current) return;

    const map = L.map(mapaRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    const customIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          background: #1D4ED8; border: 2.5px solid #60A5FA;
          border-radius: 50% 50% 50% 0; width: 36px; height: 36px;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(29,78,216,0.5);
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">${ikona}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(
        `<div style="
          background: #0F172A;
          color: #F1F5F9;
          font-weight: 700;
          font-size: 13px;
          padding: 6px 10px;
          border-radius: 8px;
        ">${naziv}</div>`,
        { className: "dark-popup" }
      );

    return () => { map.remove(); };
  }, [lat, lng, naziv, ikona]);

  return (
    <div
      ref={mapaRef}
      style={{ width: "100%", height: 220, borderRadius: "0 0 24px 24px", overflow: "hidden" }}
    />
  );
}

export default function InfoSekcija({
  slikaUrl,
  adresa,
  kvart,
  kapacitet,
  klub,
  opis,
  lat,
  lng,
  naziv,
  sportovi,
}: ProširenaInfoSekcijaProps) {
  const finalnaSlika =
    slikaUrl ||
    `https://loremflickr.com/800/600/stadium,sports?lock=${adresa.length}`;

  const prvaSport = sportovi?.[0] ?? "";

  return (
    <div className="bg-white p-5 rounded-[32px] border border-blue-50 shadow-xl shadow-blue-900/5 space-y-6">
      <div className="w-full h-[25rem] rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner">
        <img
          src={finalnaSlika}
          alt={`Slika objekta na adresi ${adresa}`}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="px-3">
        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-5 text-center lg:text-left">
          O objektu
        </h3>
        <div className="grid gap-4 text-slate-700">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-50 rounded-lg text-lg">📍</span>
            <p className="font-medium">
              {adresa}, <span className="text-slate-400">{kvart}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-50 rounded-lg text-lg">👥</span>
            <p className="font-medium">Kapacitet: {kapacitet} osoba</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-50 rounded-lg text-lg">🛡️</span>
            <p className="font-medium">Klub: {klub}</p>
          </div>
        </div>
      </div>

      <div className="pt-6 px-3 border-t border-slate-100">
        <p className="text-slate-500 leading-relaxed italic text-sm text-center lg:text-left">
          "{opis}"
        </p>
      </div>

      {lat && lng && naziv && (
        <div className="border-t border-slate-100" style={{ margin: "0 -20px -20px -20px" }}>
          <div style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
            📍 Lokacija na karti
          </div>
          <MiniMapa lat={lat} lng={lng} naziv={naziv} sport={prvaSport} />
        </div>
      )}
    </div>
  );
}