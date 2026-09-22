import { apiClient } from '@/shared/api/axios';

import type {
  NotificationListParams,
  NotificationListResponse,
  NotificationSimpleResponse,
  UnreadNotificationCountResponse,
} from '../model/types';

export async function getNotificationList(params?: NotificationListParams): Promise<NotificationListResponse> {
  // 서버 요청 page는 1부터 시작 (응답 pageInfo.page는 0부터 시작이라 프론트 상태는 0-based로 유지하고 여기서만 보정)
  const requestParams = params?.page !== undefined ? { ...params, page: params.page + 1 } : params;
  const response = await apiClient.get<NotificationListResponse>('/notifications', { params: requestParams });
  return response.data;
}

export async function getUnreadNotificationCount(): Promise<UnreadNotificationCountResponse> {
  const response = await apiClient.get<UnreadNotificationCountResponse>('/notifications/count/unread');
  return response.data;
}

export async function updateNotificationReadState(
  notificationId: number,
  isRead: boolean,
): Promise<NotificationSimpleResponse> {
  const response = await apiClient.patch<NotificationSimpleResponse>(`/notifications/${notificationId}`, { isRead });
  return response.data;
}

export async function markAllNotificationsRead(): Promise<NotificationSimpleResponse> {
  const response = await apiClient.patch<NotificationSimpleResponse>('/notifications/read-all');
  return response.data;
}

export async function deleteNotification(notificationId: number): Promise<NotificationSimpleResponse> {
  const response = await apiClient.delete<NotificationSimpleResponse>(`/notifications/${notificationId}`);
  return response.data;
}

export async function deleteAllNotifications(): Promise<NotificationSimpleResponse> {
  const response = await apiClient.delete<NotificationSimpleResponse>('/notifications/all');
  return response.data;
}
