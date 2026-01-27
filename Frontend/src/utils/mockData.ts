import {User,Student,Route,BusLocation,Notification,Incident,AttendanceRecord,ScheduledAbsence,LatePattern,OptimizedRoute} from '../types';


// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    email: 'parent@test.com',
    role: 'parent',
    avatar: 'https://i.pravatar.cc/150?u=u1'
  },
  {
    id: 'u2',
    name: 'Nadeesha Sanjaya',
    email: 'nadee@dr.com',
    role: 'driver',
    avatar: 'https://i.pravatar.cc/150?u=u2'
  },
  {
    id: 'u3',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=u3'
  }];


// Mock Routes
export const MOCK_ROUTES: Route[] = [
  {
    id: 'r1',
    name: 'Route A - Colombo District',
    busNumber: 'BUS-101',
    driverId: 'u2',
    stops: ['Colombo Fort Railway Station', 'Galle Road', 'Union Place', 'Royal College'],
    schedule: [
      { stop: 'Colombo Fort Railway Station', time: '07:00 AM' },
      { stop: 'Galle Road', time: '07:15 AM' },
      { stop: 'Union Place', time: '07:30 AM' },
      { stop: 'Royal College', time: '07:45 AM' }],

    status: 'on_time'
  },
  {
    id: 'r2',
    name: 'Route B - Gampaha District',
    busNumber: 'BUS-102',
    driverId: 'u4',
    stops: ['Kadawatha', 'Yakkala', 'Nittambuwa'],
    schedule: [
      { stop: 'Kadawatha', time: '07:10 AM' },
      { stop: 'Yakkala', time: '07:35 AM' },
      { stop: 'Nittambuwa', time: '07:50 AM' }],

    status: 'delayed'
  }];


// Mock Students
export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Kasuni Fernando',
    grade: '3rd',
    parentId: 'u1',
    routeId: 'r1',
    status: 'on_bus',
    checkInTime: '07:15 AM',
    avatar: 'https://i.pravatar.cc/150?u=s1'
  },
  {
    id: 's2',
    name: 'Dilshan Gunasekara',
    grade: '5th',
    parentId: 'u5',
    routeId: 'r1',
    status: 'at_home',
    avatar: 'https://i.pravatar.cc/150?u=s2'
  },
  {
    id: 's3',
    name: 'Isuru Jayasinghe',
    grade: '2nd',
    parentId: 'u6',
    routeId: 'r1',
    status: 'at_school',
    checkInTime: '07:10 AM',
    checkOutTime: '07:45 AM',
    avatar: 'https://i.pravatar.cc/150?u=s3'
  },
  {
    id: 's4',
    name: 'Sanduni Rathnayake',
    grade: '4th',
    parentId: 'u1',
    routeId: 'r1',
    status: 'absent',
    avatar: 'https://i.pravatar.cc/150?u=s4'
  },
  {
    id: 's5',
    name: 'Tharindu Wijesinghe',
    grade: '3rd',
    parentId: 'u7',
    routeId: 'r1',
    status: 'at_home',
    avatar: 'https://i.pravatar.cc/150?u=s5'
  },
  {
    id: 's6',
    name: 'Chamod Wickramasinghe',
    grade: '4th',
    parentId: 'u8',
    routeId: 'r1',
    status: 'at_home',
    avatar: 'https://i.pravatar.cc/150?u=s6'
  }];


// Mock Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Bus Delayed',
    message: 'Route A is delayed by 10 minutes due to traffic.',
    type: 'warning',
    timestamp: '2023-10-27T07:20:00',
    read: false
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Kasuni Boarded',
    message: 'Kasuni has boarded the bus at Galle Road.',
    type: 'success',
    timestamp: '2023-10-27T07:15:00',
    read: true
  },
  {
    id: 'n3',
    userId: 'u1',
    title: 'Emergency Alert',
    message: 'School closed tomorrow due to weather.',
    type: 'error',
    timestamp: '2023-10-26T18:00:00',
    read: true
  }];


// Mock Incidents
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'i1',
    driverId: 'u2',
    routeId: 'r1',
    type: 'traffic',
    description: 'Heavy congestion on Main St.',
    severity: 'low',
    timestamp: '2023-10-27T07:25:00',
    status: 'open'
  }];


// Mock Attendance History
export const MOCK_ATTENDANCE_HISTORY: AttendanceRecord[] = Array.from({
  length: 30
}).map((_, i) => ({
  id: `att-${i}`,
  studentId: 's1',
  date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
  status: Math.random() > 0.1 ? 'present' : 'absent',
  checkIn: '07:15 AM',
  checkOut: '03:30 PM'
}));

// NEW: Mock Scheduled Absences
export const MOCK_SCHEDULED_ABSENCES: ScheduledAbsence[] = [
  {
    id: 'sa1',
    studentId: 's1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    reason: 'Doctor appointment',
    createdAt: new Date().toISOString(),
    notifiedDriver: true,
    notifiedAdmin: true
  },
  {
    id: 'sa2',
    studentId: 's4',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days
    reason: 'Family vacation',
    createdAt: new Date().toISOString(),
    notifiedDriver: true,
    notifiedAdmin: true
  },
  {
    id: 'sa3',
    studentId: 's2',
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days
    reason: 'Sick leave',
    createdAt: new Date().toISOString(),
    notifiedDriver: false,
    notifiedAdmin: false
  }];


// NEW: Mock Late Patterns
export const MOCK_LATE_PATTERNS: LatePattern[] = [
  {
    studentId: 's2',
    studentName: 'Dilshan Gunasekara',
    totalLateCount: 8,
    latePercentage: 26.7,
    lastLateDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    trend: 'worsening',
    averageDelayMinutes: 12
  },
  {
    studentId: 's5',
    studentName: 'Tharindu Wijesinghe',
    totalLateCount: 5,
    latePercentage: 16.7,
    lastLateDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    trend: 'stable',
    averageDelayMinutes: 8
  },
  {
    studentId: 's6',
    studentName: 'Chamod Wickramasinghe',
    totalLateCount: 3,
    latePercentage: 10.0,
    lastLateDate: new Date(Date.now() - 432000000).toISOString().split('T')[0],
    trend: 'improving',
    averageDelayMinutes: 5
  }];


// NEW: Mock Optimized Routes
export const MOCK_OPTIMIZED_ROUTES: OptimizedRoute[] = [
  {
    routeId: 'r1',
    originalStops: [
      'Colombo Fort Railway Station',
      'Galle Road',
      'Union Place',
      'Royal College'],

    optimizedStops: ['Colombo Fort Railway Station', 'Galle Road', 'Union Place'],
    skippedStops: ['Galle Road'],
    timeSaved: 8,
    studentsActive: 3,
    studentsAbsent: 1,
    efficiency: 87.5
  },
  {
    routeId: 'r2',
    originalStops: ['Kadawatha', 'Yakkala', 'Nittambuwa'],
    optimizedStops: ['Kadawatha', 'Yakkala', 'Nittambuwa'],
    skippedStops: [],
    timeSaved: 0,
    studentsActive: 5,
    studentsAbsent: 0,
    efficiency: 100
  }];


// Helper to simulate API delay
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));