//@ts-nocheck
import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Download, Users, Bus, Clock, AlertTriangle } from "lucide-react";

export default function GenReport({ onBack }: any) {
  const [reportType, setReportType] = useState("transport");

  const userReports = [
    ["U001", "Hasini Perera", "Parent", "Active"],
    ["U002", "Nadeesha Sanjaya", "Driver", "Active"],
    ["U003", "Admin User", "Admin", "Active"],
    ["U004", "Sanduni Silva", "Parent", "Pending"],
  ];

  const transportReports = [
    ["Route A", "Bus-01", "94%", "Good"],
    ["Route B", "Bus-04", "89%", "Stable"],
    ["Route C", "Bus-08", "76%", "Needs Attention"],
    ["Route D", "Bus-11", "97%", "Excellent"],
  ];

  const isUserReport = reportType === "users";
  const tableData = isUserReport ? userReports : transportReports;

  const handleDownload = () => {
    const headers = isUserReport
      ? ["User ID", "Name", "Role", "Status"]
      : ["Route", "Bus", "On-Time Rate", "Status"];

    const csv = [headers, ...tableData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = isUserReport ? "user_report.csv" : "transport_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
          <p className="text-gray-600 mt-1">
            View and download RideSafe report summaries
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>

          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-violet-600 to-purple-600"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Students",
            value: "1,248",
            icon: Users,
            style: "from-rose-100 to-pink-200 border-pink-300",
            iconBg: "bg-pink-400",
          },
          {
            title: "Active Buses",
            value: "18",
            icon: Bus,
            style: "from-amber-100 to-yellow-200 border-yellow-300",
            iconBg: "bg-yellow-400",
          },
          {
            title: "On-Time Rate",
            value: "94%",
            icon: Clock,
            style: "from-emerald-100 to-green-200 border-green-300",
            iconBg: "bg-green-400",
          },
          {
            title: "Incidents",
            value: "3",
            icon: AlertTriangle,
            style: "from-orange-100 to-red-200 border-orange-300",
            iconBg: "bg-orange-400",
          },
        ].map((card, i) => {
          const Icon = card.icon;

          return (
            <div
              key={i}
              className={`relative p-6 rounded-3xl border bg-gradient-to-br ${card.style}
        shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.03]
        transition-all duration-300 group overflow-hidden`}
            >
              {/* Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition bg-white blur-xl"></div>

              {/* Top Row */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 font-medium">
                  {card.title}
                </p>

                <div className={`p-3 rounded-2xl ${card.iconBg} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Value */}
              <p className="text-3xl font-bold text-gray-900 mt-4">
                {card.value}
              </p>

              {/* Bubble */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/40 rounded-full blur-xl group-hover:scale-125 transition"></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setReportType("users")}
          className={`p-6 rounded-2xl border text-left transition-all duration-300 ${isUserReport
            ? "bg-gradient-to-r from-purple-400 to-violet-600 text-white shadow-lg shadow-purple-300"
            : "bg-purple-200 border-purple-400 hover:scale-[1.01]"
            }`}
        >
          <Users className="h-7 w-7 mb-3" />
          <h2 className="text-xl font-bold">User Reports</h2>
          <p className={isUserReport ? "text-white/80" : "text-gray-600"}>
            View parent, driver, and admin account records
          </p>
        </button>

        <button
          onClick={() => setReportType("transport")}
          className={`p-6 rounded-2xl border text-left transition-all duration-300 ${!isUserReport
            ? "bg-gradient-to-r from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-300"
            : "bg-blue-100 border-blue-400 hover:scale-[1.01]"
            }`}
        >
          <Bus className="h-7 w-7 mb-3" />
          <h2 className="text-xl font-bold">Transport Reports</h2>
          <p className={!isUserReport ? "text-white/80" : "text-gray-600"}>
            View route, bus, on-time rate, and transport status
          </p>
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className={isUserReport ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
            <tr>
              {(isUserReport
                ? ["User ID", "Name", "Role", "Status"]
                : ["Route", "Bus", "On-Time Rate", "Status"]
              ).map((head) => (
                <th key={head} className="p-4 text-left font-bold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="p-4 text-gray-700 font-medium">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}