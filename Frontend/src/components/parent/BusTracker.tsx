import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { BusLocation } from '../../types';
export function BusTracker() {
  const [location, setLocation] = useState<BusLocation>({
    routeId: 'r1',
    lat: 50,
    lng: 50,
    speed: 35,
    heading: 90,
    nextStop: 'Galle Road',
    eta: '5 mins'
  });
  // Simulate bus movement
  useEffect(() => {
    const interval = setInterval(() => {
      setLocation((prev) => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 5,
        lng: prev.lng + (Math.random() - 0.5) * 5,
        speed: Math.floor(Math.random() * 20) + 20,
        eta: `${Math.floor(Math.random() * 10) + 2} mins`
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Card title="Live Bus Tracking" className="h-full flex flex-col">
      {/* Mock Map View */}
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4 group">
        {/* Map Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#7c3aed 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
        </div>

        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M0 50 Q 50 50, 100 80 T 200 80 T 300 50 T 400 80"
            stroke="#cbd5e1"
            strokeWidth="8"
            fill="none" />

          <path
            d="M100 0 L 100 200"
            stroke="#cbd5e1"
            strokeWidth="8"
            fill="none" />

        </svg>

        {/* Bus Marker */}
        <div
          className="absolute transition-all duration-[3000ms] ease-linear flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${location.lat}%`,
            left: `${location.lng}%`
          }}>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary-500 opacity-20 rounded-full animate-ping"></div>
            <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
              <Navigation className="h-5 w-5 text-white transform rotate-45" />
            </div>
          </div>
          <div className="mt-1 bg-white px-2 py-1 rounded shadow text-xs font-bold text-gray-800 whitespace-nowrap">
            BUS-101
          </div>
        </div>

        {/* Stops */}
        <div className="absolute top-[50%] left-[20%] flex flex-col items-center">
          <div className="h-4 w-4 bg-gray-400 rounded-full border-2 border-white shadow"></div>
          <span className="text-xs font-medium text-gray-600 mt-1">Home</span>
        </div>
        <div className="absolute top-[80%] left-[80%] flex flex-col items-center">
          <div className="h-4 w-4 bg-gray-400 rounded-full border-2 border-white shadow"></div>
          <span className="text-xs font-medium text-gray-600 mt-1">School</span>
        </div>
      </div>

      {/* Info Panel */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 p-3 rounded-lg">
          <div className="flex items-center text-primary-700 mb-1">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold uppercase">
              ETA Next Stop
            </span>
          </div>
          <p className="text-xl font-bold text-primary-900">{location.eta}</p>
          <p className="text-xs text-primary-600">
            Arriving at {location.nextStop}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center text-gray-700 mb-1">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-xs font-semibold uppercase">Status</span>
          </div>
          <div className="flex items-center mt-1">
            <Badge variant="success">On Route</Badge>
            <span className="text-xs text-gray-500 ml-2">
              {location.speed} mph
            </span>
          </div>
        </div>
      </div>
    </Card>);

}