//@ts-nocheck

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function IncidentReport() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentType, setIncidentType] = useState('traffic');
  const [severity, setSeverity] = useState('low');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter an incident description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/incident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reported_by: Number(user?.id || 1),
          route_id: 1,
          description: description.trim(),
          type: incidentType,
          severity
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to report incident');
      }

      setDescription('');
      setIncidentType('traffic');
      setSeverity('low');
      alert('Incident reported to admin.');
    } catch (error) {
      alert((error as Error).message || 'Failed to report incident');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card title="Report Incident" className="border-red-100">
      <div className="mb-4 flex items-center p-3 bg-red-50 text-red-800 rounded-lg text-sm">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
        Use this form for accidents, delays, or behavioral issues.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          name="incidentType"
          label="Incident Type"
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          options={[
          {
            value: 'traffic',
            label: 'Heavy Traffic / Delay'
          },
          {
            value: 'mechanical',
            label: 'Mechanical Issue'
          },
          {
            value: 'behavior',
            label: 'Student Behavior'
          },
          {
            value: 'medical',
            label: 'Medical Emergency'
          },
          {
            value: 'other',
            label: 'Other'
          }]
          } />


        <Select
          name="severity"
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          options={[
          {
            value: 'low',
            label: 'Low - Informational'
          },
          {
            value: 'medium',
            label: 'Medium - Requires Attention'
          },
          {
            value: 'high',
            label: 'High - Immediate Action Required'
          }]
          } />


        <Textarea
          name="description"
          label="Description"
          placeholder="Describe what happened..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required />


        <Button
          type="submit"
          variant="danger"
          className="w-full"
          isLoading={isSubmitting}>

          Submit Report
        </Button>
      </form>
    </Card>);

}