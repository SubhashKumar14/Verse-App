import api from './api'

export const getUser       = (id)       => api.get(`/users/${id}`)
export const searchUsers   = (q)        => api.get(`/users/search?q=${q}`)
export const updateProfile = (id, data) => api.put(`/users/${id}`, data)
export const toggleFollow  = (id)       => api.post(`/users/${id}/follow`)
export const getFollowing  = (id)       => api.get(`/users/${id}/following`)
export const getFollowers  = (id)       => api.get(`/users/${id}/followers`)
