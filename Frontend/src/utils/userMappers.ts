import { BackendUser, UiUser } from '../types/userRegistration';
import { createAvatar, normalizeRole } from './userHelpers';

export function mapBackendUserToUi(user: BackendUser): UiUser {
  return {
    id: `u-${user.user_id}`,
    backendUserId: user.user_id,
    username: user.username,
    name: user.full_name,
    email: user.email || '',
    phone: user.phone || '',
    role: normalizeRole(user.role),
    status: user.status,
    avatar: createAvatar(user.email || '', user.full_name || '')
  };
}