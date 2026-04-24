import React, { useEffect, useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import {
  Mail,
  Phone,
  UserCircle,
  GraduationCap,
  MapPin,
  ArrowRight,
  Clock,
} from "lucide-react";

export function ViewRegisterRequests({ onSelect }: any) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/register-requests/");
      const data = await res.json();

      const pendingOnly = data.filter(
        (req: any) => (req.request_status || "pending") === "pending"
      );

      setRequests(pendingOnly);
    } catch (error) {
      console.error("Failed to load register requests", error);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    "from-purple-50 to-violet-100 border-purple-200",
    "from-indigo-50 to-blue-100 border-indigo-200",
    "from-pink-50 to-rose-100 border-pink-200",
    "from-cyan-50 to-sky-100 border-cyan-200",
    "from-emerald-50 to-green-100 border-emerald-200",
    "from-amber-50 to-yellow-100 border-amber-200",
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Parent Register Requests
        </h2>
        <p className="text-gray-600 mt-1">
          Select a pending request to create a parent account
        </p>
      </div>

      {loading && (
        <GlassCard className="p-8 text-center">
          <p className="text-gray-600">Loading requests...</p>
        </GlassCard>
      )}

      {!loading && requests.length === 0 && (
        <GlassCard className="p-8 text-center">
          <p className="text-gray-600">No pending register requests found.</p>
        </GlassCard>
      )}

      <div className="space-y-5">
        {requests.map((req, index) => (
          <div
            key={req.request_id}
            onClick={() => onSelect(req)}
            className="cursor-pointer group"
          >
            <GlassCard
              className={`p-6 border bg-gradient-to-r ${
                colors[index % colors.length]
              } hover:shadow-2xl hover:scale-[1.015] transition-all duration-300`}
            >
              <div className="flex items-start justify-between gap-5">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserCircle className="h-6 w-6 text-purple-600" />
                    {req.parent_name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {req.email || "No email"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {req.phone_number || "No phone"}
                    </p>

                    <p className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      {req.student_name || "No student"} - Grade{" "}
                      {req.student_grade || "-"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Student Index: {req.student_index}
                    </p>

                    <p className="flex items-center gap-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {req.address || "No address"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                    {req.request_status || "pending"}
                  </span>

                  <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center shadow group-hover:bg-purple-600 group-hover:text-white transition">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}