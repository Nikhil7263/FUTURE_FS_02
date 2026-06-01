import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Leads
export const getLeads = (params) => api.get('/leads', { params });
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post('/leads', data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getStats = () => api.get('/leads/stats');

// Notes
export const addNote = (id, content) => api.post(`/leads/${id}/notes`, { content });
export const deleteNote = (id, noteId) => api.delete(`/leads/${id}/notes/${noteId}`);

// Follow-ups
export const addFollowUp = (id, data) => api.post(`/leads/${id}/followups`, data);
export const updateFollowUp = (id, fuId, data) => api.put(`/leads/${id}/followups/${fuId}`, data);
export const deleteFollowUp = (id, fuId) => api.delete(`/leads/${id}/followups/${fuId}`);

export default api;