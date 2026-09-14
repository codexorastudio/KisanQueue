import React, { useState, useEffect, useRef } from "react";
import { useKisanQueue } from "@/lib/store";
import { t } from "@/lib/translations";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  UsersRound,
  Sparkles,
  ExternalLink,
  Layers,
  LocateFixed,
  Maximize2,
  CalendarDays,
  MoreHorizontal,
  Wheat,
} from "lucide-react";

interface CentreMapViewProps {
  onBack: () => void;
  onSelectCentre: (name: string) => void;
}

// Precise geographic coordinates for Central Travancore / Kerala cluster
const CENTRE_COORDS: Record<string, { lat: number; lng: number; area: string }> = {
  "centre-ktm": { lat: 9.5916, lng: 76.5222, area: "Nagampadam, Kottayam" },
  "centre-pala": { lat: 9.7117, lng: 76.6841, area: "Main Road, Pala" },
  "centre-cgry": { lat: 9.4442, lng: 76.5413, area: "Market Road, Changanassery" },
  "centre-alpy": { lat: 9.4981, lng: 76.3388, area: "Kuttanad Canal Road, Alappuzha" },
};

const FARMER_LOCATION = {
  lat: 9.593,
  lng: 76.4312,
  name: "Your Farm (Kumarakom / Kottayam)",
};

export function CentreMapView({ onBack, onSelectCentre }: CentreMapViewProps) {
  const { centres, getRecommendedCentre, language } = useKisanQueue();
  const recommendedCentre = getRecommendedCentre();
  const [selectedId, setSelectedId] = useState(recommendedCentre.id);
  const [mapType, setMapType] = useState<"street" | "satellite">("satellite");
  const [isMapReady, setIsMapReady] = useState(false);

  const activeCentre = (centres.find((c) => c.id === selectedId) || centres[0] || recommendedCentre)!;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const routeLineRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Initialize interactive Leaflet map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      // Create Leaflet instance centered on Kerala cluster
      const map = L.map(mapContainerRef.current, {
        center: [9.58, 76.51],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Default satellite aerial photography
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri Satellite",
        }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;

      // 1. Add Farmer Origin Marker
      const farmerIcon = L.divIcon({
        className: "custom-farmer-pin",
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">
            <div style="background:#111815; color:white; padding:5px 12px; border-radius:18px; font-size:10.5px; font-weight:800; border:1.5px solid rgba(255,255,255,0.4); display:flex; align-items:center; gap:6px; white-space:nowrap;">
              <span>🚜</span>
              <span>My Farm (Kumarakom)</span>
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:7px solid #111815; margin-top:-1px;"></div>
          </div>
        `,
        iconSize: [140, 36],
        iconAnchor: [70, 36],
      });

      L.marker([FARMER_LOCATION.lat, FARMER_LOCATION.lng], { icon: farmerIcon })
        .addTo(map)
        .bindPopup(
          `<strong>🚜 Your Farm</strong><br><span style="font-size:11px; color:#6b7280;">Kumarakom Agricultural Belt</span>`
        );

      // 2. Add Centre Pins (Speech-bubble style matching reference)
      centres.forEach((c) => {
        const coords = CENTRE_COORDS[c.id] || { lat: 9.58, lng: 76.52 };
        const isRec = c.id === recommendedCentre.id;

        const centreIcon = L.divIcon({
          className: `custom-centre-pin-${c.id}`,
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor:pointer; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.3));">
              <div style="background:white; color:#111815; padding:6px 12px; border-radius:20px; font-size:11px; font-weight:800; border:2px solid ${isRec ? '#123D35' : '#e5e7eb'}; display:flex; align-items:center; gap:6px; white-space:nowrap;">
                <span style="display:inline-flex; width:20px; height:20px; border-radius:50%; background:#123D35; color:white; align-items:center; justify-content:center; font-size:10px;">🌾</span>
                <span>${c.name.replace(" Procurement Centre", "")}</span>
                <span style="background:#EDF4EE; color:#123D35; border-radius:9999px; padding:2px 8px; font-size:9.5px; font-weight:700;">
                  ${c.currentQueueLength} in line · ${c.distanceKm} km
                </span>
              </div>
              <div style="width:0; height:0; border-left:7px solid transparent; border-right:7px solid transparent; border-top:8px solid white; margin-top:-1px;"></div>
            </div>
          `,
          iconSize: [160, 42],
          iconAnchor: [80, 42],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: centreIcon })
          .addTo(map)
          .on("click", () => {
            setSelectedId(c.id);
          });

        markersRef.current[c.id] = marker;
      });

      // Force size recomputation
      setTimeout(() => {
        map.invalidateSize();
        setIsMapReady(true);
      }, 150);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centres, recommendedCentre.id]);

  // Handle map type toggle (Street vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapType === "satellite") {
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri Satellite",
        }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    } else {
      const streetLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: "Carto / OSM",
        }
      );
      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;
    }
  }, [mapType]);

  // Reactively pan, highlight, and draw route polyline to selected centre
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const coords = CENTRE_COORDS[selectedId];
    if (!coords) return;

    // Smoothly fly to selected centre
    map.flyTo([coords.lat, coords.lng], 12.5, {
      duration: 1.2,
    });

    // Remove existing route line
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // Draw connecting dashed route polyline from Farmer -> Centre
    const latlngs = [
      [FARMER_LOCATION.lat, FARMER_LOCATION.lng],
      [coords.lat, coords.lng],
    ];

    const polyline = L.polyline(latlngs, {
      color: "#123D35",
      weight: 3.5,
      dashArray: "8, 10",
      opacity: 0.9,
    }).addTo(map);

    routeLineRef.current = polyline;
  }, [selectedId]);

  // Zoom control helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const points: [number, number][] = [
      [FARMER_LOCATION.lat, FARMER_LOCATION.lng],
      ...Object.values(CENTRE_COORDS).map((c) => [c.lat, c.lng] as [number, number]),
    ];

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="content-stack pt-2 space-y-3.5">
      {/* Top Header Bar matching Reference Design */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted shadow-sm transition-transform active:scale-95"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-sm font-bold text-foreground">{t(language, "myFieldsCentres")}</h1>
          <p className="text-[11px] text-muted-foreground font-medium">{t(language, "mapsView")}</p>
        </div>
        <button
          type="button"
          onClick={() => setMapType(mapType === "satellite" ? "street" : "satellite")}
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted shadow-sm transition-transform active:scale-95"
          title={mapType === "satellite" ? t(language, "mapView") : t(language, "satelliteView")}
        >
          <Layers className="size-4 text-primary" />
        </button>
      </div>

      {/* Interactive Map Container */}
      <div className="relative h-[340px] w-full overflow-hidden rounded-[28px] border border-border bg-muted shadow-md">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Floating Custom Map Controls */}
        <div className="absolute right-3.5 top-3.5 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex size-9 items-center justify-center rounded-full bg-card/95 border border-border font-bold text-foreground hover:bg-muted shadow-md transition-all text-base"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex size-9 items-center justify-center rounded-full bg-card/95 border border-border font-bold text-foreground hover:bg-muted shadow-md transition-all text-base"
            title="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleFitAll}
            className="flex size-9 items-center justify-center rounded-full bg-card/95 border border-border text-foreground hover:bg-muted shadow-md transition-all"
            title="Fit All Kerala Centres"
          >
            <Maximize2 className="size-4 text-primary" />
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 rounded-2xl bg-card/90 border border-border/80 px-3 py-2 backdrop-blur-md shadow-md text-[10px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🚜</span>
            <span>Your Farm (Kumarakom)</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Optimal Procurement Flow</span>
          </div>
        </div>
      </div>

      {/* Pull-up Bottom Sheet Drawer */}
      <div className="rounded-[30px] border border-border bg-card p-5 shadow-lg space-y-4">
        {/* Drag Handle Indicator */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/20" />

        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-foreground">{activeCentre.name}</h2>
              {activeCentre.id === recommendedCentre.id && (
                <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="size-3" /> ⭐ {t(language, "recommendedCentre")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{activeCentre.location}</p>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              activeCentre.status === "normal"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : activeCentre.status === "busy"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
            }`}
          >
            {activeCentre.status === "normal"
              ? t(language, "congestionLow")
              : activeCentre.status === "busy"
              ? t(language, "congestionMed")
              : t(language, "delayReported")}
          </span>
        </div>

        {/* Quick Centre Switcher Pills */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {t(language, "procurementCentres")} ({centres.length})
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {centres.map((c) => {
              const isSelected = c.id === selectedId;
              const isRec = c.id === recommendedCentre.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`flex flex-col items-start rounded-2xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold truncate">
                      {c.name.replace(" Procurement Centre", "")}
                    </span>
                    {isRec && <span className="text-[10px]">⭐</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {c.distanceKm} km · {c.currentQueueLength} in line
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Action CTAs */}
        <div className="flex gap-2.5 pt-1">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(activeCentre.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <Navigation className="size-4 text-primary" /> {t(language, "directions")}
          </a>

          <button
            type="button"
            onClick={() => onSelectCentre(activeCentre.name)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
          >
            <CalendarDays className="size-4" /> {t(language, "bookAtCentre")}
          </button>
        </div>
      </div>
    </div>
  );
}
