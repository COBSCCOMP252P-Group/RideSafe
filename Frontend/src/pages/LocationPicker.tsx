// src/pages/LocationPicker.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../hooks/useAuth";
import { IoArrowBack, IoSave, IoSearch, IoCalendar } from "react-icons/io5";

// Custom marker icons for different types
const PickupIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const DropoffIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Interface for search results
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
  osm_type: string;
  osm_id: number;
}

interface SearchResult {
  display_name: string;
  latitude: number;
  longitude: number;
}

interface LocationData {
  id: number;
  student_id: number;
  location_id: number;
  longitude: number;
  latitude: number;
  type: string;
  date?: string;
}

interface StudentPickupPointsResponse {
  student_id: number;
  student_name: string;
  permanent_pickup_points: LocationData[];
  temporary_pickup_points: LocationData[];
}

// Move map helper component
function MoveMap({ position }: { position: LatLngTuple | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 17);
    }
  }, [position, map]);

  return null;
}

// Draggable marker component
function DraggableMarker({
  position,
  setPosition,
  markerType
}: {
  position: LatLngTuple | null;
  setPosition: (p: LatLngTuple) => void;
  markerType: "pickup" | "dropoff";
}) {
  const [isDragging, setIsDragging] = useState(false);
  const icon = markerType === "pickup" ? PickupIcon : DropoffIcon;

  useMapEvents({
    click(e) {
      if (!isDragging) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    }
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          setIsDragging(false);
        },
        dragstart: () => {
          setIsDragging(true);
        }
      }}
    >
      <Popup className="custom-popup">
        <div style={{ padding: "8px", minWidth: "150px" }}>
          <strong style={{ fontSize: "14px" }}>
            {markerType === "pickup" ? "📍 Pickup Location" : "🏠 Dropoff Location"}
          </strong>
          <br />
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </span>
          <br />
          <em style={{ fontSize: "11px", color: "#3b82f6" }}>💡 Drag to adjust</em>
        </div>
      </Popup>
    </Marker>
  );
}

// Multiple results selection modal
function ResultsModal({
  results,
  onSelect,
  onClose
}: {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80%",
          overflow: "auto",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
        }}
      >
        <h3 style={{ marginBottom: "12px", color: "#1e293b", fontSize: "20px" }}>
          Multiple locations found
        </h3>
        <p style={{ marginBottom: "24px", color: "#64748b", fontSize: "14px" }}>
          Please select the correct location:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => onSelect(result)}
              style={{
                padding: "16px",
                textAlign: "left",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eff6ff";
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <strong style={{ fontSize: "15px", color: "#1e293b" }}>
                {result.display_name.split(",")[0]}
              </strong>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                {result.display_name}
              </div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}>
                📍 {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "12px",
            width: "100%",
            background: "#64748b",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#475569";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#64748b";
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Main component
export default function LocationPicker() {
  const { type, studentId } = useParams<{ type: string; studentId: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const center: LatLngTuple = [7.2083, 79.8358];

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<LatLngTuple | null>(null);
  const [existingLocationId, setExistingLocationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Determine the type of location picker
  const isPermanent = type === "permanent-pickup" || type === "permanent-dropoff";
  const isPickup = type?.includes("pickup") || false;
  const isTemporary = type?.includes("temporary") || false;

  const locationType = isPickup ? "pickup" : "dropoff";
  const markerIconType = isPickup ? "pickup" : "dropoff";
  const title = `${isPermanent ? "Permanent" : "Temporary"} ${isPickup ? "Pickup" : "Dropoff"} Location`;
  const bgColor = isPickup ? "linear-gradient(135deg, #166534, #14532d)" : "linear-gradient(135deg, #991b1b, #7f1d1d)";

  // Set default date to today for temporary locations
  useEffect(() => {
    if (isTemporary) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [isTemporary]);

  // Load existing location when component mounts or date changes
  useEffect(() => {
    if (studentId && type) {
      loadExistingLocation();
    }
  }, [studentId, type, selectedDate]);

  const loadExistingLocation = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      let url = "";
      if (isPermanent) {
        url = `http://localhost:8000/student-location/students/${studentId}/permanent`;
      } else {
        url = `http://localhost:8000/student-location/students/${studentId}/temporary/by-date?date_param=${selectedDate}`;
      }

      const response = await authFetch(url);

      if (response.ok) {
        const data = await response.json();

        if (isPermanent) {
          // For permanent locations, data has pickup and dropoff properties
          const matchingLocation = locationType === "pickup" ? data.pickup : data.dropoff;

          if (matchingLocation && matchingLocation.latitude && matchingLocation.longitude) {
            setPosition([matchingLocation.latitude, matchingLocation.longitude]);
            setExistingLocationId(matchingLocation.id);
            setMessage(`✓ Existing ${title.toLowerCase()} loaded. You can adjust it if needed.`);
            setMessageType("success");
          } else {
            setMessage(`No existing ${title.toLowerCase()} found. Please select a location on the map.`);
            setMessageType("info");
          }
        } else {
          // Temporary location response format
          const locations = data.locations || [];
          const matchingLocation = locations.find((loc: LocationData) => loc.type === locationType);

          if (matchingLocation && matchingLocation.latitude && matchingLocation.longitude) {
            setPosition([matchingLocation.latitude, matchingLocation.longitude]);
            setExistingLocationId(matchingLocation.id);
            setMessage(`✓ Existing ${title.toLowerCase()} loaded for ${selectedDate}. You can adjust it if needed.`);
            setMessageType("success");
          } else {
            setMessage(`No existing ${title.toLowerCase()} found for ${selectedDate}. Please select a location on the map.`);
            setMessageType("info");
          }
        }
      } else if (response.status === 404) {
        setMessage(`No existing ${title.toLowerCase()} found. Please select a location on the map.`);
        setMessageType("info");
      } else {
        throw new Error("Failed to load location");
      }
    } catch (err) {
      console.error("Error loading location:", err);
      setMessage(`⚠️ Could not load existing location. You can set a new one.`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const searchAddress = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setMessage("Searching...");
    setMessageType("info");

    try {
      const params = new URLSearchParams({
        q: search,
        format: "json",
        limit: "10",
        addressdetails: "0",
        "accept-language": "en"
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            "User-Agent": "SchoolBusApp/1.0",
            "Accept-Language": "en"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NominatimResult[] = await response.json();

      if (!data || data.length === 0) {
        setMessage("❌ No results found for this address");
        setMessageType("error");
        setSearchResults([]);
        setLoading(false);
        return;
      }

      const formattedResults: SearchResult[] = data.map((item) => ({
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));

      setSearchResults(formattedResults);

      if (formattedResults.length === 1) {
        const result = formattedResults[0];
        setPosition([result.latitude, result.longitude]);
        setMessage(`✓ Location found: ${result.display_name.split(",")[0]}`);
        setMessageType("success");
      } else {
        setShowResultsModal(true);
        setMessage(`Found ${formattedResults.length} locations. Please select one.`);
        setMessageType("info");
      }
    } catch (err: any) {
      console.error("Geocoding error:", err);
      setMessage("❌ " + (err.message || "Failed to search address"));
      setMessageType("error");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setPosition([result.latitude, result.longitude]);
    setMessage(`✓ Selected: ${result.display_name.split(",")[0]}`);
    setMessageType("success");
    setShowResultsModal(false);
    setSearch("");
    setSearchResults([]);
  };

  const saveLocation = async () => {
    if (!position) {
      setMessage("⚠️ Please select a location first.");
      setMessageType("error");
      return;
    }

    if (isTemporary && !selectedDate) {
      setMessage("⚠️ Please select a date for the temporary location.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("Saving...");
    setMessageType("info");

    try {
      let url = "";
      let method = "POST";

      // Helper to create the location data correctly
      // position is [latitude, longitude] from Leaflet
      // Backend expects { longitude, latitude }
      const getLocationData = () => ({
        longitude: position[1], // position[1] is longitude
        latitude: position[0],  // position[0] is latitude
        type: locationType
      });

      let body: any;

      if (isPermanent) {
        if (existingLocationId) {
          // Update existing permanent location
          url = `http://localhost:8000/student-location/permanent/${existingLocationId}`;
          method = "PUT";
          body = getLocationData();
        } else {
          // Create new permanent location
          url = `http://localhost:8000/student-location/permanent`;
          method = "POST";
          body = {
            student_id: parseInt(studentId!),
            ...getLocationData()
          };
        }
      } else {
        // Temporary location
        if (existingLocationId) {
          // Update existing temporary location
          url = `http://localhost:8000/student-location/temporary/${existingLocationId}`;
          method = "PUT";
          body = {
            ...getLocationData(),
            date: selectedDate
          };
        } else {
          // Create new temporary location
          url = `http://localhost:8000/student-location/temporary`;
          method = "POST";
          body = {
            student_id: parseInt(studentId!),
            ...getLocationData(),
            date: selectedDate
          };
        }
      }

      console.log("Saving to:", url, "with method:", method, "body:", body);

      const response = await authFetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Save failed");
      }

      const result = await response.json();
      setExistingLocationId(result.id);
      setMessage(`✓ ${title} saved successfully! Redirecting...`);
      setMessageType("success");

      // Redirect back after 2 seconds
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err: any) {
      console.error("Save error:", err);
      setMessage(`❌ Failed to save location: ${err.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchAddress();
    }
  };

  const getMessageStyle = () => {
    switch (messageType) {
      case "success":
        return { background: "rgba(34,197,94,0.15)", borderLeft: "4px solid #22c55e" };
      case "error":
        return { background: "rgba(239,68,68,0.15)", borderLeft: "4px solid #ef4444" };
      case "info":
        return { background: "rgba(59,130,246,0.15)", borderLeft: "4px solid #3b82f6" };
      default:
        return { background: "rgba(255,255,255,0.1)", borderLeft: "4px solid transparent" };
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        background: "#f8fafc",
        overflow: "hidden"
      }}
    >
      {/* Results Modal - Now with higher z-index */}
      {showResultsModal && (
        <ResultsModal
          results={searchResults}
          onSelect={handleSelectResult}
          onClose={() => {
            setShowResultsModal(false);
            setMessage("");
            setSearchResults([]);
          }}
        />
      )}

      {/* Compact Floating Header - Fixed scrolling issue */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          right: "14px",
          zIndex: 1000,
          borderRadius: "22px",
          padding: "14px 16px",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow:
            "0 16px 40px rgba(15,23,42,0.12), 0 4px 10px rgba(15,23,42,0.06)",
          border: "1px solid rgba(255,255,255,0.65)",
          maxHeight: "none", // Remove scrolling
          overflowY: "visible" // Changed from "auto" to "visible"
        }}
      >
        {/* Row 1 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px"
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f172a"
              }}
            >
              {isPickup ? "📍" : "🏠"} {title}
            </h1>

            <p
              style={{
                margin: "2px 0 0",
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 500
              }}
            >
              {isPermanent
                ? "Daily default location"
                : "Only for selected date"}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 14px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <IoArrowBack size={16} />
            Cancel
          </button>
        </div>

        {/* Row 2 Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTemporary
              ? "2fr auto auto auto"
              : "2fr auto auto",
            gap: "8px",
            alignItems: "center"
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
            <IoSearch
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#94a3b8"
              }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search location..."
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          {/* Search */}
          <button
            onClick={searchAddress}
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              border: "none",
              background: loading
                ? "#94a3b8"
                : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "white",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "13px"
            }}
          >
            {loading ? "..." : "Search"}
          </button>

          {/* Date */}
          {isTemporary && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setExistingLocationId(null);
                setPosition(null);
                setTimeout(() => loadExistingLocation(), 100);
              }}
              style={{
                padding: "12px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                fontSize: "13px",
                outline: "none"
              }}
            />
          )}

          {/* Save */}
          <button
            onClick={saveLocation}
            disabled={loading || !position}
            style={{
              padding: "12px 18px",
              borderRadius: "14px",
              border: "none",
              background:
                loading || !position
                  ? "#cbd5e1"
                  : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "white",
              fontWeight: 700,
              cursor: loading || !position ? "not-allowed" : "pointer",
              fontSize: "13px"
            }}
          >
            Save
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px 12px",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: 600,
              ...getMessageStyle()
            }}
          >
            {message}
          </div>
        )}

        {/* Position */}
        {position && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "#475569",
              fontWeight: 500
            }}
          >
            📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ height: "100%", width: "100%" }}>
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MoveMap position={position} />

          <DraggableMarker
            position={position}
            setPosition={setPosition}
            markerType={markerIconType}
          />
        </MapContainer>
      </div>

      <style>{`
      .custom-popup .leaflet-popup-content-wrapper{
        border-radius:18px;
        box-shadow:0 20px 35px rgba(15,23,42,.15);
      }

      .leaflet-control-zoom{
        border:none !important;
        box-shadow:0 10px 30px rgba(15,23,42,.12);
        border-radius:18px !important;
        overflow:hidden;
      }

      .leaflet-control-zoom a{
        width:42px !important;
        height:42px !important;
        line-height:42px !important;
        font-size:18px !important;
      }
    `}</style>
    </div>
  );
}