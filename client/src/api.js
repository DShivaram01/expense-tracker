import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Expense endpoints ----
export const expensesAPI = {
  getAll:  ()        => api.get('/expenses').then(r => r.data),
  create:  (expense) => api.post('/expenses', expense).then(r => r.data),
  update:  (id, exp) => api.put(`/expenses/${id}`, exp).then(r => r.data),
  remove:  (id)      => api.delete(`/expenses/${id}`).then(r => r.data),
};

// ---- Budget endpoints ----
export const budgetAPI = {
  get:    ()       => api.get('/budget').then(r => r.data),
  update: (amount) => api.put('/budget', { amount }).then(r => r.data),
};
