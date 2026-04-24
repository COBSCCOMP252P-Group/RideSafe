import { UserRole } from '../types';
import { FormDataType } from '../types/userRegistration';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';
    
export const emptyForm: FormDataType = {
  username: '',
  name: '',
  email: '',
  role: 'parent',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  studentIndex: '',
  studentName: '',
  studentGrade: '',
  vehicleNo: '',
  emergencyContact: ''
};

export function normalizeRole(role: string): UserRole {
  const value = String(role || '').toLowerCase();
  if (value === 'admin') return 'admin';
  if (value === 'driver') return 'driver';
  return 'parent';
}

export function createAvatar(email: string, name: string) {
  const seed = email || name || Math.random().toString(36).slice(2);
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
}

export function getStoredToken() {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

export function validateUserForm(formData: FormDataType, editingUser: any) {
  if (!formData.username.trim()) {
    throw new Error('Username is required');
  }

  if (!formData.name.trim()) {
    throw new Error('Full name is required');
  }

  if (!formData.email.trim()) {
    throw new Error('Email is required');
  }

  if (!editingUser && !formData.password.trim()) {
    throw new Error('Password is required');
  }

  if (formData.password || formData.confirmPassword) {
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Password and confirm password do not match');
    }
  }

  if (formData.role === 'parent') {
    if (!formData.address.trim()) {
      throw new Error('Address is required for parent');
    }
    if (!formData.studentName.trim()) {
      throw new Error('Student name is required for parent');
    }
    if (!formData.studentGrade.trim()) {
      throw new Error('Student grade is required for parent');
    }
    if (!formData.studentIndex.trim()) {
      throw new Error('Student index is required for parent');
    }
  }

  if (formData.role === 'driver') {
    if (!formData.vehicleNo.trim()) {
      throw new Error('Vehicle No is required for driver');
    }
    if (!formData.emergencyContact.trim()) {
      throw new Error('Emergency contact is required for driver');
    }
  }
}