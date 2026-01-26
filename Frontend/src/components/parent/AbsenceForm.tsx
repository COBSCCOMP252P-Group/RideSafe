//@ts-nocheck
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { MOCK_STUDENTS } from '../../utils/mockData';
export function AbsenceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };
  return (
    <Card title="Report Absence">
      {success ?
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">
            Absence reported successfully!
          </p>
          <p className="text-green-600 text-sm mt-1">
            The driver and school have been notified.
          </p>
        </div> :

      <form onSubmit={handleSubmit} className="space-y-4">
          <Select
          label="Select Child"
          options={MOCK_STUDENTS.filter((s) => s.parentId === 'u1').map(
            (s) => ({
              value: s.id,
              label: s.name
            })
          )} />


          <Input
          label="Date of Absence"
          type="date"
          required
          min={new Date().toISOString().split('T')[0]} />


          <Select
          label="Reason"
          options={[
          {
            value: 'sick',
            label: 'Sick / Medical'
          },
          {
            value: 'family',
            label: 'Family Emergency'
          },
          {
            value: 'vacation',
            label: 'Vacation'
          },
          {
            value: 'other',
            label: 'Other'
          }]
          } />


          <Textarea
          label="Additional Notes (Optional)"
          placeholder="Please provide any relevant details..."
          rows={3} />


          <div className="pt-2">
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Submit Report
            </Button>
          </div>
        </form>
      }
    </Card>);

}