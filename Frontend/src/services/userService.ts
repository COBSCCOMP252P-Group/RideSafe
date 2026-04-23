import { FormDataType } from '../types/userRegistration';
import { API_BASE_URL, getStoredToken } from '../utils/userHelpers';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getAllUsers() {
  return apiFetch('/user/', { method: 'GET' });
}

export async function createAdminUser(formData: FormDataType) {
  return apiFetch('/user/', {
    method: 'POST',
    body: JSON.stringify({
      username: formData.username.trim(),
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: 'admin'
    })
  });
}

export async function createDriverUser(formData: FormDataType) {
  return apiFetch('/drivers/', {
    method: 'POST',
    body: JSON.stringify({
      username: formData.username.trim(),
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      license_number: formData.vehicleNo.trim(),
      emergency_contact: formData.emergencyContact.trim()
    })
  });
}

export async function createParentAndStudent(formData: FormDataType) {
  const parent = await apiFetch('/parents/', {
    method: 'POST',
    body: JSON.stringify({
      username: formData.username.trim(),
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      address: formData.address.trim()
    })
  });

  const parentId = parent?.parent_id;
  if (!parentId) {
    throw new Error('Parent created, but parent_id was not returned by backend');
  }

  await apiFetch('/students/', {
    method: 'POST',
    body: JSON.stringify({
      full_name: formData.studentName.trim(),
      grade: formData.studentGrade.trim(),
      parent_id: parentId,
      status: 'active',
      index_no: formData.studentIndex.trim()
    })
  });

  return parent;
}

export async function updateCommonUser(userId: number, formData: FormDataType) {
  const payload: any = {
    username: formData.username.trim(),
    full_name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    role: formData.role
  };

  if (formData.password.trim()) {
    payload.password = formData.password;
  }

  return apiFetch(`/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteUser(userId: number) {
  return apiFetch(`/user/${userId}`, {
    method: 'DELETE'
  });
}