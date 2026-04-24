import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { SosButton, SOSLocation, SOSStatusBadge } from './SosButton';

interface SOSAlert {
  sos_id: number;
  driver_id: number;
  bus_id: number;
  latitude: string;
  longitude: string;
  triggered_at: string;
  resolved_status: boolean;
}

export function DriverSOSPanel() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/sos?driver_id=${Number(user?.id || 1)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load SOS alerts');
      }
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <Card title="Emergency SOS">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-600">
            Use SOS only for urgent emergency situations.
          </p>
          <SosButton onTriggered={loadAlerts} />
        </div>
      </Card>

      <Card
        title="My SOS Alerts"
        headerAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={loadAlerts}
            isLoading={loading}>
            Refresh
          </Button>
        }>

        {loading && <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>}

        {!loading && alerts.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">No SOS alerts yet.</p>
        )}

        {!loading && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.sos_id}
                className="p-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50">

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold text-gray-900">SOS #{alert.sos_id}</span>
                  </div>
                  <SOSStatusBadge resolved={alert.resolved_status} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.triggered_at).toLocaleString()}
                  </span>
                  <SOSLocation latitude={alert.latitude} longitude={alert.longitude} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
