import api from './api';

const paths = {
  departments: '/api/master/departments',
  programmes: '/api/master/programmes',
  blocks: '/api/master/blocks',
  rooms: '/api/master/rooms',
  roles: '/api/master/roles',
  users: '/api/master/users',
  complainttypes: '/api/master/complaint-types', // <-- add this
};

export function getPath(name) {
  const key = String(name || '').toLowerCase();
  if (!paths[key]) throw new Error(`Unknown master: ${name}`);
  return paths[key];
}

export async function listMaster(name) {
  const { data } = await api.get(getPath(name));
  return data;
}

export async function createMaster(name, payload) {
  const { data } = await api.post(getPath(name), payload);
  return data;
}

export async function updateMaster(name, id, payload) {
  const { data } = await api.put(`${getPath(name)}/${id}`, payload);
  return data;
}

export async function deleteMaster(name, id) {
  const { data } = await api.delete(`${getPath(name)}/${id}`);
  return data;
}