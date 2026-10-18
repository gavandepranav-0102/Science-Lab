// Drop-in API helper for the SciLab Vite frontend.
// Import this file from your main.js and replace localStorage auth calls with these functions.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`);
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  guest: () => request('/auth/guest', { method: 'POST' }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  history: () => request('/experiments/history'),
  saveExperiment: (body) => request('/experiments/history', { method: 'POST', body: JSON.stringify(body) }),
  deleteExperiment: (id) => request(`/experiments/history/${id}`, { method: 'DELETE' }),
  clearHistory: () => request('/experiments/history', { method: 'DELETE' }),
  chat: (body) => request('/ai/chat', { method: 'POST', body: JSON.stringify(body) })
};
