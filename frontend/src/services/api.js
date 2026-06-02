import axios from 'axios'

const API_BASE = 'https://light-speed-web-task.buildcodechain.com'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

export const contactService = {
  getAll: () => api.get('/contacts'),
  getById: (id) => api.get(`/contacts/${id}`),
  
  create: (formData) => api.post('/contacts/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  update: (id, formData) => {
    return api.post(`/contacts/${id}/update?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  delete: (id) => api.delete(`/contacts/${id}/delete`),
}

export default api
