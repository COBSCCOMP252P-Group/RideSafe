//@ts-nocheck

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { AlertTriangle } from 'lucide-react';
export function IncidentReport() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Incident reported to admin.');
    }, 1000);
  };
  return (
    <Card title="Report Incident" className="border-red-100">
      <div className="mb-4 flex items-center p-3 bg-red-50 text-red-800 rounded-lg text-sm">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
        Use this form for accidents, delays, or behavioral issues.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Incident Type"
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
          label="Severity"
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
          label="Description"
          placeholder="Describe what happened..."
          rows={4}
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