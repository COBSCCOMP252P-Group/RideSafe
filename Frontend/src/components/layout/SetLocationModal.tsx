// src/components/SetLocationModal.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoPerson, IoLocation, IoTrash, IoCreate } from "react-icons/io5";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Student {
  student_id: number;
  full_name: string;
  parent_id: number;
  grade?: string;
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

export default function SetLocationModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentLocations, setStudentLocations] = useState<StudentPickupPointsResponse | null>(null);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      fetchStudents();
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await authFetch("http://localhost:8000/parents/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0].student_id);
          fetchStudentLocations(data[0].student_id);
        }
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLocations = async (studentId: number) => {
    setLoading(true);
    try {
      // Use the correct endpoint that matches your backend
      const response = await authFetch(`http://localhost:8000/student-location/students/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentLocations(data);
      } else {
        setStudentLocations(null);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setStudentLocations(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId: number) => {
    setSelectedStudentId(studentId);
    fetchStudentLocations(studentId);
  };

  const handleAddLocation = (type: string, isPermanent: boolean) => {
    if (!selectedStudentId) return;
    
    // Match the route pattern used in TestLocationPicker: `/location/${type}-${locationType}/${studentId}`
    const routeType = isPermanent ? "permanent" : "temporary";
    const path = `${routeType}-${type}`;
    navigate(`/location/${path}/${selectedStudentId}`);
    onClose();
  };

  const handleEditLocation = (locationId: number, type: string, isPermanent: boolean, date?: string) => {
    if (!selectedStudentId) return;
    
    // Same route pattern for editing
    const routeType = isPermanent ? "permanent" : "temporary";
    const path = `${routeType}-${type}`;
    navigate(`/location/${path}/${selectedStudentId}`);
    onClose();
  };

  const handleDeleteLocation = async (locationId: number, isPermanent: boolean) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    
    setLoading(true);
    try {
      // Use the correct DELETE endpoint based on your backend
      const type = isPermanent ? "permanent" : "temporary";
      const url = `http://localhost:8000/student-location/${type}/${locationId}`;
      
      const response = await authFetch(url, { method: "DELETE" });
      
      if (response.ok) {
        alert("Location deleted successfully!");
        if (selectedStudentId) {
          fetchStudentLocations(selectedStudentId);
        }
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px"
      }}
    >
      {/* Modal Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "1300px",
          height: "92vh",
          background: "rgba(255,255,255,0.96)",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,.18)",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(255,255,255,.6)"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 28px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(135deg, rgba(59,130,246,.08), rgba(16,185,129,.08))"
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 800,
                color: "#0f172a"
              }}
            >
              📍 Manage Student Locations
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              Set permanent and temporary pickup / dropoff points
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "16px",
              border: "none",
              background: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
            background: "#f8fafc"
          }}
        >
          {/* Student Selector */}
          <div
            style={{
              background: "white",
              borderRadius: "22px",
              padding: "22px",
              boxShadow: "0 8px 25px rgba(15,23,42,.05)",
              marginBottom: "22px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px"
              }}
            >
              <IoPerson size={22} color="#2563eb" />
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#0f172a"
                }}
              >
                Select Student
              </h3>
            </div>

            <select
              value={selectedStudentId || ""}
              onChange={(e) => handleStudentChange(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                outline: "none",
                background: "white",
                cursor: "pointer"
              }}
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "16px",
              marginBottom: "22px"
            }}
          >
            <button
              onClick={() => handleAddLocation("pickup", true)}
              style={{
                padding: "18px",
                borderRadius: "20px",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: "0 12px 24px rgba(0,0,0,.08)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,.08)";
              }}
            >
              📍 + Permanent Pickup
            </button>

            <button
              onClick={() => handleAddLocation("dropoff", true)}
              style={{
                padding: "18px",
                borderRadius: "20px",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 12px 24px rgba(0,0,0,.08)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,.08)";
              }}
            >
              🏠 + Permanent Dropoff
            </button>

            <button
              onClick={() => handleAddLocation("pickup", false)}
              style={{
                padding: "18px",
                borderRadius: "20px",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 12px 24px rgba(0,0,0,.08)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,.08)";
              }}
            >
              📅 + Temporary Pickup
            </button>

            <button
              onClick={() => handleAddLocation("dropoff", false)}
              style={{
                padding: "18px",
                borderRadius: "20px",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 12px 24px rgba(0,0,0,.08)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,.08)";
              }}
            >
              📅 + Temporary Dropoff
            </button>
          </div>

          {/* Current Locations */}
          <div
            style={{
              background: "white",
              borderRadius: "22px",
              padding: "24px",
              boxShadow: "0 8px 25px rgba(15,23,42,.05)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px"
              }}
            >
              <IoLocation size={22} color="#16a34a" />
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: "#0f172a"
                }}
              >
                Current Locations
              </h3>
            </div>

            {(!studentLocations?.permanent_pickup_points?.length && 
              !studentLocations?.temporary_pickup_points?.length) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#64748b",
                  background: "#f8fafc",
                  borderRadius: "16px"
                }}
              >
                No locations added yet. Click the buttons above to add locations.
              </div>
            )}

            {/* Permanent Locations */}
            {studentLocations?.permanent_pickup_points?.map((location) => (
              <div
                key={location.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "18px",
                  marginBottom: "14px",
                  background: "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong style={{ color: "#0f172a" }}>
                    {location.type === "pickup" ? "📍 Pickup" : "🏠 Dropoff"} 
                    {" "} <span style={{ fontSize: "12px", color: "#16a34a" }}>(Permanent)</span>
                  </strong>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      marginTop: "6px",
                      fontFamily: "monospace"
                    }}
                  >
                    📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px"
                  }}
                >
                  <button
                    onClick={() => handleEditLocation(location.id, location.type, true)}
                    style={{
                      border: "none",
                      background: "#3b82f6",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#3b82f6";
                    }}
                  >
                    <IoCreate /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteLocation(location.id, true)}
                    style={{
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ef4444";
                    }}
                  >
                    <IoTrash /> Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Temporary Locations */}
            {studentLocations?.temporary_pickup_points?.map((location) => (
              <div
                key={location.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "18px",
                  marginBottom: "14px",
                  background: "#fefce8",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                <div>
                  <strong style={{ color: "#0f172a" }}>
                    {location.type === "pickup" ? "📍 Pickup" : "🏠 Dropoff"} 
                    {" "} <span style={{ fontSize: "12px", color: "#ea580c" }}>(Temporary - {location.date})</span>
                  </strong>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      marginTop: "6px",
                      fontFamily: "monospace"
                    }}
                  >
                    📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px"
                  }}
                >
                  <button
                    onClick={() => handleEditLocation(location.id, location.type, false, location.date)}
                    style={{
                      border: "none",
                      background: "#3b82f6",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#3b82f6";
                    }}
                  >
                    <IoCreate /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteLocation(location.id, false)}
                    style={{
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ef4444";
                    }}
                  >
                    <IoTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "18px 28px",
            borderTop: "1px solid #e5e7eb",
            background: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span style={{ color: "#64748b", fontSize: "14px" }}>
            Manage all location points here
          </span>

          <button
            onClick={onClose}
            style={{
              padding: "12px 20px",
              borderRadius: "16px",
              border: "none",
              background: "#0f172a",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1e293b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0f172a";
            }}
          >
            Done
          </button>
        </div>
      </div>

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,.8)",
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px 30px",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0,0,0,.15)",
              fontWeight: "bold",
              color: "#3b82f6"
            }}
          >
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}