// src/components/Map.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// ---------------------------
// Heading helpers
// ---------------------------

function getBearing(a: LatLngTuple, b: LatLngTuple): number {
    const lat1 = (a[0] * Math.PI) / 180;
    const lat2 = (b[0] * Math.PI) / 180;
    const dLng = ((b[1] - a[1]) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function createRotatedBusIcon(heading: number): L.DivIcon {
    const rotation = heading - 90;

    return L.divIcon({
        className: "",
        html: `
      <div style="
        width: 40px;
        height: 40px;
        transform: rotate(${rotation}deg) scaleX(-1);
        transform-origin: center center;
        transition: transform 0.4s ease;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      ">
        <img
          src="src/components/images/bus-icon.png"
          width="40"
          height="40"
          style="display:block; width:100%; height:100%; object-fit:contain;"
        />
      </div>
    `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
}

// ---------------------------
// Static icons
// ---------------------------

const StopIcon = L.divIcon({
    className: "",
    html: `
    <div style="
      width: 16px; height: 16px;
      background: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>
  `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
});

const SchoolIcon = L.icon({
    iconUrl: "src/components/images/school-icon.png",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
});

const UserLocationIcon = L.divIcon({
    className: "",
    html: `
    <div style="position: relative; width: 20px; height: 20px;">
      <div style="
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 36px; height: 36px;
        background: rgba(59,130,246,0.25);
        border-radius: 50%;
        animation: pulse 1.8s ease-out infinite;
      "></div>
      <div style="
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 16px; height: 16px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(59,130,246,0.6);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%   { transform: translate(-50%,-50%) scale(0.8); opacity:1; }
        100% { transform: translate(-50%,-50%) scale(2.2); opacity:0; }
      }
    </style>
  `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
});

// ---------------------------
// Types
// ---------------------------

interface Vehicle {
    id: number;
    position: LatLngTuple;
    name: string;
    isBus: boolean;
}

interface RouteStop {
    latitude: number;
    longitude: number;
    stop_name: string;
}

interface RouteResponse {
    route_stops: RouteStop[];
}

const SCHOOL_LOCATION: LatLngTuple = [7.2150, 79.8400];

// ---------------------------
// Helpers
// ---------------------------

function distanceMeters(a: LatLngTuple, b: LatLngTuple): number {
    const R = 6371000;
    const φ1 = (a[0] * Math.PI) / 180;
    const φ2 = (b[0] * Math.PI) / 180;
    const Δφ = ((b[0] - a[0]) * Math.PI) / 180;
    const Δλ = ((b[1] - a[1]) * Math.PI) / 180;

    const x =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function interpolate(a: LatLngTuple, b: LatLngTuple, t: number): LatLngTuple {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

interface Segment {
    from: LatLngTuple;
    to: LatLngTuple;
    dist: number;
}

function buildSegments(coords: LatLngTuple[]): { segments: Segment[]; total: number } {
    const segments: Segment[] = [];
    let total = 0;

    for (let i = 0; i < coords.length - 1; i++) {
        const dist = distanceMeters(coords[i], coords[i + 1]);
        segments.push({
            from: coords[i],
            to: coords[i + 1],
            dist,
        });
        total += dist;
    }

    return { segments, total };
}

function positionAtDistance(
    segments: Segment[],
    total: number,
    travelled: number
): { pos: LatLngTuple; bearing: number } {
    let remaining = travelled % total;

    for (const seg of segments) {
        if (remaining <= seg.dist) {
            const t = remaining / seg.dist;

            return {
                pos: interpolate(seg.from, seg.to, t),
                bearing: getBearing(seg.from, seg.to),
            };
        }

        remaining -= seg.dist;
    }

    const last = segments[segments.length - 1];

    return {
        pos: last.to,
        bearing: getBearing(last.from, last.to),
    };
}

// ---------------------------
// Routing Engine
// ---------------------------

interface RoutingEngineProps {
    waypoints: LatLngTuple[];
    onRouteReady: (coords: LatLngTuple[]) => void;
}

function RoutingEngine({ waypoints, onRouteReady }: RoutingEngineProps) {
    const map = useMap();
    const controlRef = useRef<any>(null);
    const calledBack = useRef(false);

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        if (controlRef.current) {
            map.removeControl(controlRef.current);
            controlRef.current = null;
        }

        calledBack.current = false;

        const control = (L.Routing as any).control({
            waypoints: waypoints.map(([lat, lng]) => L.latLng(lat, lng)),
            lineOptions: {
                styles: [{ color: "#1d4ed8", weight: 5, opacity: 0.8 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
        });

        control.on("routesfound", (e: any) => {
            if (calledBack.current) return;

            calledBack.current = true;

            const coords: LatLngTuple[] = e.routes[0].coordinates.map(
                (c: any) => [c.lat, c.lng]
            );

            onRouteReady(coords);
        });

        control.addTo(map);
        controlRef.current = control;

        return () => {
            if (controlRef.current) {
                map.removeControl(controlRef.current);
                controlRef.current = null;
            }
        };
    }, [map, waypoints, onRouteReady]);

    return null;
}

// ---------------------------
// Bus speed
// ---------------------------

const BUS_SPEED_MPS = 8;

// ---------------------------
// Map Component
// ---------------------------

export default function Map() {
    const [searchParams] = useSearchParams();

    const studentId = 1;
    const driverId = searchParams.get("driver_id");

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [busHeading, setBusHeading] = useState(90);
    const [roadPath, setRoadPath] = useState<{ segments: Segment[]; total: number } | null>(null);
    const [legendOpen, setLegendOpen] = useState(false);
    const [routeWaypoints, setRouteWaypoints] = useState<LatLngTuple[]>([]);

    const travelledRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    // ---------------------------
    // FETCH ROUTE
    // ---------------------------

    useEffect(() => {
        loadRoute();
    }, []);

    const loadRoute = async () => {
        try {
            let url = "http://localhost:8000/routes";

            if (studentId) {
                url = `http://localhost:8000/routes/student/${studentId}`;
            } else if (driverId) {
                url = `http://localhost:8000/routes/driver/${driverId}`;
            }

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Failed to load route: ${res.status}`);
            }

            const data = await res.json();

            const route = data; // backend returns single object

            if (!route?.route_stops?.length) {
                console.warn("No route stops found");
                return;
            }

            const points = route.route_stops.map(
                (x: any) => [x.latitude, x.longitude] as LatLngTuple
            );

            setRouteWaypoints(points);

            setVehicles([
                {
                    id: 1,
                    position: points[0],
                    name: "Bus 001 — Live",
                    isBus: true,
                },
                {
                    id: 2,
                    position: points[points.length - 1],
                    name: "Terminal Stop",
                    isBus: false,
                },
            ]);
        } catch (err) {
            console.error("Route loading error:", err);
        }
    };

    // ---------------------------
    // Route ready callback
    // ---------------------------

    const handleRouteReady = useMemo(
        () => (coords: LatLngTuple[]) => {
            setRoadPath(buildSegments(coords));
        },
        []
    );

    // ---------------------------
    // Animation
    // ---------------------------

    useEffect(() => {
        if (!roadPath) return;

        const animate = (timestamp: number) => {
            if (lastTimeRef.current !== null) {
                const delta = (timestamp - lastTimeRef.current) / 1000;
                travelledRef.current += BUS_SPEED_MPS * delta;
            }

            lastTimeRef.current = timestamp;

            const { pos, bearing } = positionAtDistance(
                roadPath.segments,
                roadPath.total,
                travelledRef.current
            );

            setVehicles((prev) =>
                prev.map((v) => (v.id === 1 ? { ...v, position: pos } : v))
            );

            setBusHeading(bearing);

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            lastTimeRef.current = null;
        };
    }, [roadPath]);

    // ---------------------------
    // GPS
    // ---------------------------

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                setLocationError(null);
            },
            (err) => setLocationError(err.message),
            { enableHighAccuracy: true, maximumAge: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const center = useMemo<LatLngTuple>(() => {
        return routeWaypoints[0] || [7.2083, 79.8358];
    }, [routeWaypoints]);

    const busIcon = useMemo(() => createRotatedBusIcon(busHeading), [busHeading]);

    return (
        <div style={{ height: "100vh", width: "100%", position: "relative" }}>
            {/* Legend */}
            <div style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 1000,
                fontFamily: "sans-serif",
                fontSize: 13,
            }}>
                <button
                    onClick={() => setLegendOpen((prev) => !prev)}
                    style={{
                        width: 38,
                        height: 38,
                        background: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                >
                    i
                </button>

                {legendOpen && (
                    <div style={{
                        marginTop: 8,
                        background: "white",
                        borderRadius: 12,
                        padding: "12px 16px",
                    }}>
                        Live Tracking
                    </div>
                )}
            </div>

            <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {vehicles.map((v) => (
                    <Marker
                        key={v.id}
                        position={v.position}
                        icon={v.isBus ? busIcon : StopIcon}
                    >
                        <Popup>
                            <strong>{v.name}</strong>
                        </Popup>
                    </Marker>
                ))}

                <Marker position={SCHOOL_LOCATION} icon={SchoolIcon}>
                    <Popup>School</Popup>
                </Marker>

                {userLocation && (
                    <Marker position={userLocation} icon={UserLocationIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {routeWaypoints.length >= 2 && (
                    <RoutingEngine
                        waypoints={routeWaypoints}
                        onRouteReady={handleRouteReady}
                    />
                )}
            </MapContainer>
        </div>
    );
}