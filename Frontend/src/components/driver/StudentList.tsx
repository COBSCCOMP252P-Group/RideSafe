//@ts-nocheck
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MOCK_STUDENTS } from '../../utils/mockData';
import { Check, LogOut, Phone } from 'lucide-react';
export function StudentList() {
  // Local state to simulate check-in/out updates
  const [students, setStudents] = useState(MOCK_STUDENTS);
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
                onClick={() => handleStatusChange(student.id, 'on_bus')}
                className="bg-green-600 hover:bg-green-700">

                      <Check className="h-4 w-4 mr-1" /> Board
                    </Button> :

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                handleStatusChange(student.id, 'at_school')
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