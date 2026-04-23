//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, LogOut, Phone } from 'lucide-react';
import { useAttendance } from '../../hooks/useAttendance';

export function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { checkIn, checkOut } = useAttendance();

  // Fetch students from backend on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        // Map backend response to match component requirements
        const mappedStudents = data.map(student => ({
          id: student.student_id,
          name: student.full_name,
          grade: student.grade,
          status: 'on_bus', // Set default, will update on check-in/out
          avatar: `https://i.pravatar.cc/150?u=s${student.student_id}`
        }));
        setStudents(mappedStudents);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStatusChange = (
    id: string,
    newStatus: 'on_bus' | 'at_school' | 'at_home') =>
  {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ?
        {
          ...s,
          status: newStatus
        } :
        s
      )
    );
  };

  const handleBoard = async (studentId) => {
    try {
      await checkIn({
        student_id: studentId,
        bus_id: 1,  // Get from current route
        route_id: 1
      });
      handleStatusChange(studentId, 'on_bus');
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  };

  const handleDrop = async (studentId) => {
    try {
      await checkOut({
        student_id: studentId,
        bus_id: 1
      });
      handleStatusChange(studentId, 'at_school');
    } catch (err) {
      console.error('Check-out failed:', err);
    }
  };

  if (loading) {
    return <Card title="Student Manifest - Route A" className="h-full">
      <p className="text-center text-gray-500">Loading students...</p>
    </Card>;
  }

  if (error) {
    return <Card title="Student Manifest - Route A" className="h-full">
      <p className="text-center text-red-500">{error}</p>
    </Card>;
  }

  return (
    <Card title="Student Manifest - Route A" className="h-full">
      <div className="space-y-4">
        {students.map((student) =>
        <div
          key={student.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">

            <div className="flex items-center space-x-3">
              <img
              src={student.avatar}
              alt={student.name}
              className="h-10 w-10 rounded-full object-cover" />

              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {student.name}
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    {student.grade} Grade
                  </span>
                  <Badge
                  variant={
                  student.status === 'on_bus' ?
                  'success' :
                  student.status === 'absent' ?
                  'danger' :
                  'neutral'
                  }>

                    {student.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {student.status !== 'absent' &&
            <>
                  {student.status !== 'on_bus' ?
              <Button
                size="sm"
                onClick={() => handleBoard(student.id)}
                className="bg-green-600 hover:bg-green-700">

                      <Check className="h-4 w-4 mr-1" /> Board
                    </Button> :

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                handleDrop(student.id)
                }>

                      <LogOut className="h-4 w-4 mr-1" /> Drop
                    </Button>
              }
                </>
            }
              <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-primary-600">

                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>);

}
