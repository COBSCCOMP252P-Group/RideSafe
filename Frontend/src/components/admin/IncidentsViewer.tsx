import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Clock, User, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Incident {
  incident_id: number;
  reported_by: number;
  route_id: number;
  description: string;
  type: string;
  severity: string | null;
  reported_at: string;
}

function severityVariant(severity: string | null): 'danger' | 'warning' | 'neutral' {
  if (!severity) return 'neutral';
  const s = severity.toLowerCase();
  if (s === 'high') return 'danger';
  if (s === 'medium') return 'warning';
  return 'neutral';
}

function typeLabel(type: string) {
  if (!type) return 'Incident';
  const t = type.toUpperCase();
  if (t === 'DELAY') return 'Delay';
  return 'Incident';
}

export function IncidentsViewer() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/incident');
      if (!res.ok) throw new Error('Failed to fetch incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <Card
      title="All Incidents"
      className="w-full"
      headerAction={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={fetchIncidents}
          isLoading={loading}>
          Refresh
        </Button>
      }>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="flex justify-center py-12 text-gray-400 text-sm">
          Loading incidents…
        </div>
      )}

      {!loading && !error && incidents.length === 0 && (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <AlertTriangle className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">No incidents reported yet.</p>
        </div>
      )}

      {!loading && incidents.length > 0 && (
        <div className="space-y-3">
          {incidents.map((incident, index) => (
            <motion.div
              key={incident.incident_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow duration-200">

              <div className="mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-gray-900">
                    {typeLabel(incident.type)} — #{incident.incident_id}
                  </h4>
                  <Badge variant={severityVariant(incident.severity)}>
                    {incident.severity ? `${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Severity` : 'Unknown Severity'}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mt-1 break-words">
                  {incident.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Driver #{incident.reported_by}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Route #{incident.route_id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(incident.reported_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Lightweight version used in Overview — shows only the latest 3
export function RecentIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/incident')
      .then((r) => r.json())
      .then((data: Incident[]) => setIncidents(data.slice(0, 3)))
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>;
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-400">
        <AlertTriangle className="h-8 w-8 mb-1 opacity-30" />
        <p className="text-sm">No incidents yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident, index) => (
        <motion.div
          key={incident.incident_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
          className="flex items-start p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow duration-200">

          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 capitalize">
              {typeLabel(incident.type)} Issue
            </h4>
            <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant={severityVariant(incident.severity)}>
                {incident.severity
                  ? `${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Severity`
                  : 'Unknown Severity'}
              </Badge>
              <span className="text-xs text-gray-400">
                {new Date(incident.reported_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
