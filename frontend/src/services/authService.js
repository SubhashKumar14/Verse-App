import api from './api'

export const register = (data) => api.post('/common/register', data)
export const login    = (data) => api.post('/common/login', data)
export const logout   = ()     => api.post('/common/logout')
export const getAuthUser = ()  => api.get('/common/user')
