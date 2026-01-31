export type UserRole = 'parent' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentId: string;
  routeId: string;
  status: 'at_home' | 'on_bus' | 'at_school' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
  avatar?: string;
}

export interface Route {
  id: string;
  name: string;
  busNumber: string;
  driverId: string;
  stops: string[];
  schedule: {stop: string;time: string;}[];
  status: 'on_time' | 'delayed' | 'completed' | 'not_started';
}

export interface BusLocation {
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  nextStop: string;
  eta: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn?: string;
  checkOut?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export interface Incident {
  id: string;
  driverId: string;
  routeId: string;
  type: 'traffic' | 'mechanical' | 'behavior' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  status: 'open' | 'resolved';
}

export interface ScheduledAbsence {
  id: string;
  studentId: string;
  date: string;
  reason: string;
  createdAt: string;
  notifiedDriver: boolean;
  notifiedAdmin: boolean;
}

export interface LatePattern {
  studentId: string;
  studentName: string;
  totalLateCount: number;
  latePercentage: number;
  lastLateDate: string;
  trend: 'improving' | 'worsening' | 'stable';
  averageDelayMinutes: number;
}

export interface OptimizedRoute {
  routeId: string;
  originalStops: string[];
  optimizedStops: string[];
  skippedStops: string[];
  timeSaved: number;
  studentsActive: number;
  studentsAbsent: number;
  efficiency: number;
}

