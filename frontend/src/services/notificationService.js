/**
 * frontend/src/services/notificationService.js
 *
 * Notification API calls.
 * Fetches notifications and updates read state.
 */
import api from './api'

export const getNotifications = () => api.get('/notifications')
export const readAllNotifications = () => api.patch('/notifications/read-all')
export const readNotification = (id) => api.patch(`/notifications/${id}/read`)
