import { UserRole } from './index';

export type RoleFilter = UserRole | 'all';

export type BackendUser = {
  user_id: number;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status?: string;
};

export type UiUser = {
  id: string;
  backendUserId: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: string;
  avatar: string;
};

export type FormDataType = {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  studentIndex: string;
  studentName: string;
  studentGrade: string;
  vehicleNo: string;
  emergencyContact: string;
};