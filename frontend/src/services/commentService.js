/**
 * frontend/src/services/commentService.js
 *
 * Comment-related API calls for post threads.
 * Supports create, soft-delete, and archive restore flows.
 */
import api from './api'

export const getComments        = (postId) => api.get(`/comments/${postId}`)
export const addComment         = (postId, text) => api.post(`/comments/${postId}`, { text })
export const softDeleteComment  = (id)     => api.patch(`/comments/${id}`)
export const getArchivedComments = ()      => api.get('/comments/archives/user')
export const restoreComment     = (id)     => api.patch(`/comments/${id}/restore`)
