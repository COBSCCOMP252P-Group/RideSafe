import React, { useState } from 'react';
import { Siren, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => reject(new Error('Unable to access location')),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function SosButton({ onTriggered }: { onTriggered?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const triggerSOS = async () => {
    setLoading(true);

    try {
      const { latitude, longitude } = await getCurrentLocation();

      const response = await fetch('http://localhost:8000/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: Number(user?.id || 1),
          bus_id: 1,
          latitude,
          longitude
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to trigger SOS');
      }

      alert('SOS sent to admin and emergency workflow.');
      if (onTriggered) onTriggered();
    } catch (error) {
      alert((error as Error).message || 'Failed to trigger SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={triggerSOS}
      variant="danger"
      isLoading={loading}
      leftIcon={<Siren className="h-4 w-4" />}
      className="bg-red-600 hover:bg-red-700">
      Trigger SOS
    </Button>
  );
}

export function SOSStatusBadge({ resolved }: { resolved: boolean }) {
  if (resolved) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Done
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      Working
    </span>
  );
}

export function SOSLocation({ latitude, longitude }: { latitude: string | number; longitude: string | number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <MapPin className="h-3 w-3" />
      {latitude}, {longitude}
    </span>
  );
}
