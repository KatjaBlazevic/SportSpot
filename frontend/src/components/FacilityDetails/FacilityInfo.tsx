import { useEffect, useRef } from "react";

type FacilityInfoProps = {
  slikaUrl?: string;
  adresa: string;
  kvart: string;
  kapacitet: number;
  klub: string;
  opis: string;
  lat?: number | null;
  lng?: number | null;
  naziv?: string;
  sportovi?: string[];
};

type FacilityMiniMapProps = {
  lat: number;
  lng: number;
  naziv: string;
  sport: string;
};

const sportIcons: Record<string, string> = {
  Tenis: "🎾",
  Padel: "🏓",
  Nogomet: "⚽",
  "Mali nogomet": "⚽",
  Košarka: "🏀",
  Odbojka: "🏐",
  Plivanje: "🏊",
  Vaterpolo: "🤽",
};

function FacilityMiniMap({ lat, lng, naziv, sport }: FacilityMiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const icon = sportIcons[sport] ?? "🏟️";

  useEffect(() => {
    // TODO: Zamijeniti any odgovarajućim Leaflet tipovima tijekom zasebnog čišćenja karte.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;

    if (!L || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      },
    ).addTo(map);

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
          <span style="transform: rotate(45deg); font-size: 16px;">${icon}</span>
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
        { className: "dark-popup" },
      );

    return () => {
      map.remove();
    };
  }, [lat, lng, naziv, icon]);

  return (
    <div ref={mapRef} className="h-55 w-full overflow-hidden rounded-b-panel" />
  );
}

export default function FacilityInfo({
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
}: FacilityInfoProps) {
  const imageUrl =
    slikaUrl ||
    `https://loremflickr.com/800/600/stadium,sports?lock=${adresa.length}`;

  const primarySport = sportovi?.[0] ?? "";

  return (
    <div className="space-y-6 rounded-[32px] border border-primary-soft bg-surface p-5 shadow-sport-card">
      <div className="h-[25rem] w-full overflow-hidden rounded-2xl border-4 border-background shadow-inner">
        <img
          src={imageUrl}
          alt={`Slika objekta na adresi ${adresa}`}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="px-3">
        <h3 className="mb-5 text-center text-xs font-black tracking-[0.2em] text-primary-light uppercase lg:text-left">
          O objektu
        </h3>

        <div className="grid gap-4 text-text-primary">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary-soft p-2 text-lg">📍</span>

            <p className="font-medium">
              {adresa}, <span className="text-text-muted">{kvart}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary-soft p-2 text-lg">👥</span>

            <p className="font-medium">Kapacitet: {kapacitet} osoba</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary-soft p-2 text-lg">🛡️</span>

            <p className="font-medium">Klub: {klub}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border-light px-3 pt-6">
        <p className="text-center text-sm leading-relaxed text-text-secondary italic lg:text-left">
          "{opis}"
        </p>
      </div>

      {lat && lng && naziv && (
        <div className="-mx-5 -mb-5 border-t border-border-light">
          <div className="px-5 py-3 text-[13px] font-bold text-text-primary">
            📍 Lokacija na karti
          </div>

          <FacilityMiniMap
            lat={lat}
            lng={lng}
            naziv={naziv}
            sport={primarySport}
          />
        </div>
      )}
    </div>
  );
}
