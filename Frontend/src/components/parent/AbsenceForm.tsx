//@ts-nocheck
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { useAttendance, useStudents } from '../../hooks/useAttendance';
export function AbsenceForm() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const { reportAbsence, loading: absenceLoading, error: absenceError } = useAttendance();
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  
  // Debug logging
  console.log('AbsenceForm - students:', students);
  console.log('AbsenceForm - studentsLoading:', studentsLoading);
  console.log('AbsenceForm - studentsError:', studentsError);
  
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !date || !reason) {
      return;
    }

    try {
      await reportAbsence({
        student_id: parseInt(selectedStudent),
        date: date,
        reason: reason + (additionalNotes ? ` - ${additionalNotes}` : '')
      });

      setSuccess(true);
      setSelectedStudent('');
      setDate('');
      setReason('');
      setAdditionalNotes('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Error is handled by the hook
    }
  };
  return (
    <Card title="Report Absence">
      {studentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading students...</span>
        </div>
      ) : studentsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">Error loading students</p>
          <p className="text-red-600 text-sm mt-1">{studentsError}</p>
        </div>
      ) : success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">Absence reported successfully!</p>
          <p className="text-green-600 text-sm mt-1">The driver and school have been notified.</p>
        </div>
      ) : (

      <form onSubmit={handleSubmit} className="space-y-4">
          <Select
          label="Select Child"
          value={selectedStudent}
          onChange={setSelectedStudent}
          options={students.map((student) => ({
            value: student.student_id.toString(),
            label: `${student.full_name} (${student.grade || 'No grade'})`
          }))}
          disabled={studentsLoading}
          required />


          <Input
          label="Date of Absence"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]} />


          <Select
          label="Reason"
          value={reason}
          onChange={setReason}
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
          }]}
          required />


          <Textarea
          label="Additional Notes (Optional)"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Please provide any relevant details..."
          rows={3} />


          <div className="pt-2">
            <Button 
              type="submit" 
              isLoading={absenceLoading} 
              disabled={studentsLoading || !selectedStudent || !date || !reason}
              className="w-full">
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Card>);

}