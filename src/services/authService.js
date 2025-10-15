import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data; // { token, user }
}

export async function register(payload) {
  const { data } = await api.post('/api/auth/register', payload);
  return data;
}

export async function me() {
  const { data } = await api.get('/api/auth/me');
  return data;
}
