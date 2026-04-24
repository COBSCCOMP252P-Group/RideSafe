import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Clock, Bus, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface SOSAlert {
  sos_id: number;
  driver_id: number;
  bus_id: number;
  latitude: string;
  longitude: string;
  triggered_at: string;
  resolved_status: boolean;
}

export function SOSAlertsManager() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/sos');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load SOS alerts');
      }
      setAlerts(data);
    } catch (e) {
      setError((e as Error).message || 'Failed to load SOS alerts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (sosId: number, status: 'WORKING' | 'DONE') => {
    setUpdatingId(sosId);
    try {
      const response = await fetch(`http://localhost:8000/sos/${sosId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update SOS status');
      }

      setAlerts((prev) =>
        prev.map((item) =>
          item.sos_id === sosId ? { ...item, resolved_status: data.resolved_status } : item
        )
      );
    } catch (error) {
      alert((error as Error).message || 'Failed to update SOS status');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <Card
      title="SOS Control Center"
      headerAction={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={fetchAlerts}
          isLoading={loading}
          disabled={updatingId !== null}>
          Refresh
        </Button>
      }>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-gray-400 py-6 text-center">Loading SOS alerts...</p>}

      {!loading && alerts.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">No SOS alerts available.</p>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.sos_id}
              className="p-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50">

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-sm text-gray-900">SOS #{alert.sos_id}</span>
                  <Badge variant={alert.resolved_status ? 'success' : 'warning'}>
                    {alert.resolved_status ? 'Done' : 'Working'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(alert.sos_id, 'WORKING')}
                    disabled={!alert.resolved_status || updatingId === alert.sos_id}
                    isLoading={updatingId === alert.sos_id}>
                    Working
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => updateStatus(alert.sos_id, 'DONE')}
                    disabled={alert.resolved_status || updatingId === alert.sos_id}
                    isLoading={updatingId === alert.sos_id}>
                    Done
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Driver #{alert.driver_id}
                </span>
                <span className="flex items-center gap-1">
                  <Bus className="h-3 w-3" />
                  Bus #{alert.bus_id}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(alert.triggered_at).toLocaleString()}
                </span>
                <span>
                  Location: {alert.latitude}, {alert.longitude}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
