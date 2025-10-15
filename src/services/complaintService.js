// src/services/complaintService.js
import api from './api';

const PATH = '/api/complaints';

// 🔹 List all complaints
export async function listComplaints() {
  const { data } = await api.get(PATH);
  return data;
}

// 🔹 Create new complaint
export async function createComplaint(payload) {
  const { data } = await api.post(PATH, payload);
  return data;
}

// 🔹 Update complaint (full update)
export async function updateComplaint(id, payload) {
  const { data } = await api.put(`${PATH}/${id}`, payload);
  return data;
}

// 🔹 Delete complaint
export async function deleteComplaint(id) {
  const { data } = await api.delete(`${PATH}/${id}`);
  return data;
}

// 🔹 Get complaint by ID
export async function getComplaint(id) {
  const { data } = await api.get(`${PATH}/${id}`);
  return data;
}

// 🔹 Update complaint status
export async function updateComplaintStatus(id, status) {
  const { data } = await api.patch(`${PATH}/${id}/status`, { status });
  return data;
}

// 🔹 Assign complaint (SuperAdmin only)
export async function assignComplaint(id, assigneeId) {
  const { data } = await api.patch(`${PATH}/${id}/assign`, { assigneeId });
  return data;
}

// 🔹 Dashboard stats (ALL roles can view)
export async function getDashboardStats() {
  const { data } = await api.get(`${PATH}/dashboard/stats`);
  return data;
}
