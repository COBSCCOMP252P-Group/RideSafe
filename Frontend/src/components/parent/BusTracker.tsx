import React, { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { MapPin, Clock, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Map from "../layout/Map";

interface BusLocation {
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  nextStop: string;
  eta: string;
}

export function BusTracker() {
  const navigate = useNavigate();

  const [location, setLocation] = useState<BusLocation>({
    routeId: "r1",
    lat: 7.2083,
    lng: 79.8358,
    speed: 35,
    heading: 90,
    nextStop: "Galle Road",
    eta: "5 mins",
  });

  // Simulate backend updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLocation((prev) => ({
        ...prev,
        speed: Math.floor(Math.random() * 20) + 20,
        eta: `${Math.floor(Math.random() * 10) + 2} mins`,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">

        <h3 className="text-lg font-semibold">
          Live Bus Tracking
        </h3>

        {/* Expand Button */}
        <button
          onClick={() => navigate("/map")}
          className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

      </div>

      {/* MAP */}
      <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-200 mb-4">
        <Map />
      </div>

      {/* INFO PANEL */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* ETA */}
        <div className="bg-primary-50 p-3 rounded-lg">
          <div className="flex items-center text-primary-700 mb-1">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold uppercase">
              ETA Next Stop
            </span>
          </div>

          <p className="text-xl font-bold text-primary-900">
            {location.eta}
          </p>

          <p className="text-xs text-primary-600">
            Arriving at {location.nextStop}
          </p>
        </div>

        {/* STATUS */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-700 mb-1">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold uppercase">
              Status
            </span>
          </div>

          <div className="flex items-center mt-1">
            <Badge variant="success">On Route</Badge>

            <span className="text-xs text-gray-500 ml-2">
              {location.speed} km/h
            </span>
          </div>
        </div>

      </div>
    </Card>
  );
}