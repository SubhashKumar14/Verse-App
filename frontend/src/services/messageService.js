/**
 * frontend/src/services/messageService.js
 *
 * Direct Messaging-related API calls:
 * - send message
 * - fetch active conversations
 * - fetch message history with a specific user
 * - fetch unread message count
 */
import api from './api'

export const sendMessage = (recipientId, text, imageFile) => {
  if (imageFile) {
    const formData = new FormData()
    formData.append('recipientId', recipientId)
    if (text) formData.append('text', text)
    formData.append('image', imageFile)
    return api.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  return api.post('/messages', { recipientId, text })
}
export const getConversations = ()                  => api.get('/messages/conversations')
export const getMessages      = (userId)            => api.get(`/messages/${userId}`)
export const getUnreadCount   = ()                  => api.get('/messages/unread-count')
