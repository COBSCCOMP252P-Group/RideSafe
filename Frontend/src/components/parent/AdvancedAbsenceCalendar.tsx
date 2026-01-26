//@ts-nocheck

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { MOCK_STUDENTS, MOCK_SCHEDULED_ABSENCES } from '../../utils/mockData';
import { Calendar, Check, AlertCircle } from 'lucide-react';
export function AdvancedAbsenceCalendar() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('s1');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) =>
    prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setSelectedDates([]);
      setReason('');
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };
  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date(Date.now() + i * 86400000);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', {
          weekday: 'short'
        }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return dates;
  };
  const dates = generateDates();
  const scheduledAbsences = MOCK_SCHEDULED_ABSENCES.filter(
    (a) => a.studentId === selectedStudent
  );
  return (
    <Card title="Schedule Future Absences" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-transparent opacity-20 rounded-full blur-3xl -z-10"></div>

      {success ?
      <motion.div
        initial={{
          scale: 0.9,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Absence Scheduled!
          </h3>
          <p className="text-gray-600 text-sm">
            Driver and admin have been notified about the upcoming absence.
          </p>
        </motion.div> :

      <form onSubmit={handleSubmit} className="space-y-6">
          <Select
          label="Select Child"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          options={MOCK_STUDENTS.filter((s) => s.parentId === 'u1').map(
            (s) => ({
              value: s.id,
              label: s.name
            })
          )} />


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Absence Date(s)
            </label>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((dateInfo) => {
              const isSelected = selectedDates.includes(dateInfo.date);
              const isScheduled = scheduledAbsences.some(
                (a) => a.date === dateInfo.date
              );
              return (
                <motion.button
                  key={dateInfo.date}
                  type="button"
                  whileHover={{
                    scale: 1.05
                  }}
                  whileTap={{
                    scale: 0.95
                  }}
                  onClick={() =>
                  !isScheduled && handleDateToggle(dateInfo.date)
                  }
                  disabled={isScheduled || dateInfo.isWeekend}
                  className={`
                      relative p-3 rounded-xl text-center transition-all duration-200
                      ${isSelected ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30' : isScheduled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : dateInfo.isWeekend ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'}
                    `}>

                    <div className="text-xs font-medium opacity-75">
                      {dateInfo.dayName}
                    </div>
                    <div className="text-lg font-bold">{dateInfo.day}</div>
                    {isScheduled &&
                  <div className="absolute -top-1 -right-1">
                        <div className="h-3 w-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                      </div>
                  }
                  </motion.button>);

            })}
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Yellow dot indicates already scheduled absence
            </p>
          </div>

          {selectedDates.length > 0 &&
        <motion.div
          initial={{
            opacity: 0,
            height: 0
          }}
          animate={{
            opacity: 1,
            height: 'auto'
          }}
          className="space-y-4">

              <Textarea
            label="Reason for Absence"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Doctor appointment, Family vacation..."
            rows={3}
            required />


              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-900 mb-2">
                  Selected Dates:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date) =>
              <span
                key={date}
                className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-primary-700 border border-primary-200">

                      {new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
                    </span>
              )}
                </div>
              </div>

              <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full"
            size="lg">

                Schedule Absence ({selectedDates.length}{' '}
                {selectedDates.length === 1 ? 'day' : 'days'})
              </Button>
            </motion.div>
        }
        </form>
      }
    </Card>);

}