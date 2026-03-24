import api from './api'

export const getFeed        = (page = 0)  => api.get(`/posts?page=${page}`)
export const getUserPosts   = (userId)    => api.get(`/posts/user/${userId}`)
export const getPost        = (id)        => api.get(`/posts/${id}`)
export const createPost     = (data)      => api.post('/posts', data, {
  headers: {
    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
  },
})
export const likePost       = (id)        => api.post(`/posts/${id}/like`)
export const softDeletePost = (id)        => api.patch(`/posts/${id}`)
export const getArchivedPosts = ()        => api.get('/posts/archives/user')
export const restorePost    = (id)        => api.patch(`/posts/${id}/restore`)
