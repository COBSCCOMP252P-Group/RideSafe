// src/services/notificationService.ts
const API_BASE = 'http://localhost:8000'; // Your FastAPI backend URL

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  type: string;  // 'boarding', 'delay', 'sos', 'announcement'
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  // GET /api/v1/notifications
  async getNotifications(token: string): Promise<Notification[]> {
    const response = await fetch(`${API_BASE}/api/v1/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  // PUT /api/v1/notifications/{id}/read
  async markAsRead(notificationId: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to mark as read');
  },
};