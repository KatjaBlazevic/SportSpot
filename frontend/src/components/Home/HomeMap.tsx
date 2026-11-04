import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import type { SportsFacility } from "../../types/sportsFacility";

type HomeMapProps = {
  facilities: SportsFacility[];
};

// API ključ se čita iz frontend/.env (VITE_GOOGLE_MAPS_KEY).
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

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

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 45.3271, lng: 14.4422 };
const DEFAULT_ZOOM = 13;
const MAX_ZOOM = 14;

// Sidri donji vrh markera na točku na karti.
const markerPixelOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -height,
});

// Čita design tokene definirane u config.css (@theme blok).
function cssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

// Gradi dark stil Google karte iz tokena definiranih u config.css
// (--color-google-map-dark-* varijable).
function buildDarkMapStyles(): google.maps.MapTypeStyle[] {
  const geometry = cssVar("--color-google-map-dark-geometry", "#242f3e");
  const textStroke = cssVar("--color-google-map-dark-text-stroke", "#242f3e");
  const textFill = cssVar("--color-google-map-dark-text-fill", "#746855");
  const textAccent = cssVar("--color-google-map-dark-text-accent", "#d59563");
  const park = cssVar("--color-google-map-dark-park", "#263c3f");
  const road = cssVar("--color-google-map-dark-road", "#38414e");
  const roadStroke = cssVar("--color-google-map-dark-road-stroke", "#212a37");
  const roadLabel = cssVar("--color-google-map-dark-road-label", "#9ca5b3");
  const highway = cssVar("--color-google-map-dark-highway", "#746855");
  const transit = cssVar("--color-google-map-dark-transit", "#2f3948");
  const water = cssVar("--color-google-map-dark-water", "#17263c");
  const waterLabel = cssVar("--color-google-map-dark-water-label", "#515c6d");

  return [
    { elementType: "geometry", stylers: [{ color: geometry }] },
    { elementType: "labels.text.stroke", stylers: [{ color: textStroke }] },
    { elementType: "labels.text.fill", stylers: [{ color: textFill }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: textAccent }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: textAccent }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: park }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: road }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: roadStroke }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: roadLabel }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: highway }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: roadStroke }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: textAccent }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: transit }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: textAccent }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: water }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: waterLabel }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: water }],
    },
  ];
}

export default function HomeMap({ facilities }: HomeMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const navigate = useNavigate();

  // Stil karte i opcije grade se iz config.css design tokena.
  const mapStyles = useMemo(() => buildDarkMapStyles(), []);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      styles: mapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
    }),
    [mapStyles],
  );

  // Koordinate iz API-ja mogu doći kao stringovi ili null,
  // pa ih pretvaramo u brojeve i odbacujemo nevažeće.
  const visibleFacilities = useMemo(
    () =>
      facilities
        .filter((facility) => facility.lat !== null && facility.lng !== null)
        .map((facility) => ({
          facility,
          position: {
            lat: Number(facility.lat),
            lng: Number(facility.lng),
          },
        }))
        .filter(
          ({ position }) =>
            Number.isFinite(position.lat) && Number.isFinite(position.lng),
        ),
    [facilities],
  );

  const fitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map || visibleFacilities.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    for (const { position } of visibleFacilities) {
      bounds.extend(position);
    }

    map.fitBounds(bounds, 40);

    google.maps.event.addListenerOnce(map, "idle", () => {
      const zoom = map.getZoom();
      if (zoom && zoom > MAX_ZOOM) {
        map.setZoom(MAX_ZOOM);
      }
    });
  }, [visibleFacilities]);

  useEffect(() => {
    if (isLoaded) {
      fitBounds();
    }
  }, [isLoaded, fitBounds]);

  if (loadError) {
    return (
      <div
        className="
          flex h-full items-center justify-center
          rounded-[20px] border border-slate-700
          bg-slate-900 text-sm text-slate-400
        "
      >
        Greška pri učitavanju karte.
      </div>
    );
  }

  return (
    <div
      className="
        relative h-full overflow-hidden
        rounded-[20px] border
        border-slate-700 bg-slate-900
        shadow-[0_4px_24px_rgb(0_0_0_/0.15)]
      "
    >
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map;
            fitBounds();
          }}
        >
          {visibleFacilities.map(({ facility, position }) => (
            <OverlayView
              key={facility.id}
              position={position}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={markerPixelOffset}
            >
              <div className="group relative">
                {/* Tooltip na hover: slika i naziv objekta.
                    Apsolutno je pozicioniran da ne mijenja sidro markera. */}
                <div
                  className="
                    pointer-events-none absolute bottom-full left-1/2 z-30
                    mb-2 w-44 -translate-x-1/2 overflow-hidden
                    rounded-control border border-border-default
                    bg-surface opacity-0 shadow-sport-elevated
                    transition-opacity duration-150
                    group-hover:opacity-100
                  "
                >
                  {facility.slikaUrl ? (
                    <img
                      src={facility.slikaUrl}
                      alt={facility.naziv}
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex h-24 w-full items-center justify-center
                        bg-primary-soft text-[32px]
                      "
                    >
                      {sportIcons[facility.sportovi[0]] ?? "🏟️"}
                    </div>
                  )}

                  <div className="px-2.5 py-2">
                    <div className="truncate text-[12px] font-bold text-text-primary">
                      {facility.naziv}
                    </div>

                    <div className="mt-0.5 truncate text-[11px] text-text-secondary">
                      📍 {facility.adresa}, {facility.kvart}
                    </div>

                    {facility.ocjena !== null && (
                      <div className="mt-0.5 text-[11px] text-text-secondary">
                        ⭐ {facility.ocjena} ({facility.brojRecenzija}{" "}
                        recenzija)
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="google-map-marker"
                  aria-label={facility.naziv}
                  onClick={() => navigate(`/objekt/${facility.id}`)}
                >
                  <span className="google-map-marker-icon">
                    {sportIcons[facility.sportovi[0]] ?? "🏟️"}
                  </span>
                </button>
              </div>
            </OverlayView>
          ))}
        </GoogleMap>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Učitavanje karte…
        </div>
      )}

      <div
        className="
          absolute top-3 right-3 z-10
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
