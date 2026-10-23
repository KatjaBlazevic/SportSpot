
import { useEffect, useRef } from "react";
import type { SportsFacility } from "../../types/sportsFacility";

type HomeMapProps = {
  facilities: SportsFacility[];
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

// Escape API podataka prije umetanja u Leaflet HTML popup.
function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export default function HomeMap({ facilities }: HomeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // TODO: Zamijeniti any odgovarajućim Leaflet tipovima
  // kada budemo uređivali integraciju Leaflet biblioteke.
// TODO: Istražiti zašto se karta nakon izdvajanja
// u HomeMap komponentu više ne prikazuje.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [45.3271, 14.4422],
        zoom: 13,
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

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (facilities.length === 0) return;

    const bounds: [number, number][] = [];

    for (const facility of facilities) {
      if (facility.lat === null || facility.lng === null) {
        continue;
      }

      const coordinates: [number, number] = [
        facility.lat,
        facility.lng,
      ];

      const icon = sportIcons[facility.sportovi[0]] ?? "🏟️";

      const price =
        facility.cijenaOd === 0
          ? "Besplatno"
          : `${facility.cijenaOd}€/h`;

      const markerIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            background: #1D4ED8;
            border: 2.5px solid #60A5FA;
            border-radius: 50% 50% 50% 0;
            width: 36px;
            height: 36px;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 12px rgba(29,78,216,0.5);
            cursor: pointer;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
            ">
              ${icon}
            </span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(coordinates, {
        icon: markerIcon,
      }).addTo(map);

      const ratingHtml =
        facility.ocjena !== null
          ? `
            <div style="
              font-size: 12px;
              color: #6B7280;
              margin-top: 4px;
            ">
              ⭐ ${escapeHtml(facility.ocjena)}
              (${escapeHtml(facility.brojRecenzija)} recenzija)
            </div>
          `
          : "";

      // TODO: Izdvojiti stilove Leaflet markera i popupova
      // u CSS klase povezane s globalnim design tokenima.
      // TODO: Nakon desktop refaktoriranja provjeriti
      // ponašanje karte u mobilnom modalu.

      marker.bindPopup(`
        <div style="
          font-family: 'DM Sans', sans-serif;
          min-width: 180px;
          padding: 4px 2px;
        ">
          <div style="
            font-weight: 700;
            font-size: 14px;
            color: #111827;
            margin-bottom: 4px;
          ">
            ${escapeHtml(facility.naziv)}
          </div>

          <div style="
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 6px;
          ">
            📍 ${escapeHtml(facility.adresa)},
            ${escapeHtml(facility.kvart)}
          </div>

          <div style="
            display: flex;
            gap: 8px;
            align-items: center;
          ">
            <span style="
              background: #EFF6FF;
              color: #1D4ED8;
              padding: 2px 8px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 600;
            ">
              ${escapeHtml(facility.sportovi[0] ?? "Sport")}
            </span>

            <span style="
              font-weight: 700;
              color: #1D4ED8;
              font-size: 13px;
            ">
              ${escapeHtml(price)}
            </span>
          </div>

          ${ratingHtml}
        </div>
      `);

      markersRef.current.push(marker);
      bounds.push(coordinates);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
      });
    }
  }, [facilities]);

  return (
    <div
      className="
        relative h-full overflow-hidden
        rounded-[20px] border
        border-slate-700 bg-slate-900
        shadow-[0_4px_24px_rgb(0_0_0_/0.15)]
      "
    >
      <div ref={mapContainerRef} className="h-full w-full" />

      <div
        className="
          absolute top-3 right-3 z-1000
          rounded-full bg-slate-900/85
          px-2.5 py-1 text-[11px]
          font-medium text-slate-400
          backdrop-blur-sm
          pointer-events-none
        "
      >
        📍 {facilities.length} objekata
      </div>
    </div>
  );
}
