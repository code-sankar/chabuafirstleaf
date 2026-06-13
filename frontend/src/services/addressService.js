import api from './api';

/**
 * Address service — all calls require a valid Supabase session
 * (Bearer token is attached automatically by the api interceptor).
 *
 * Addresses are scoped per user on the backend.
 */

export async function listAddresses() {
  const { data } = await api.get('/api/addresses');
  return data.addresses || [];
}

export async function createAddress(address) {
  const { data } = await api.post('/api/addresses', address);
  return data.address;
}

export async function updateAddress(id, updates) {
  const { data } = await api.patch(`/api/addresses/${id}`, updates);
  return data.address;
}

export async function deleteAddress(id) {
  const { data } = await api.delete(`/api/addresses/${id}`);
  return data;
}

export async function setDefaultAddress(id) {
  const { data } = await api.post(`/api/addresses/${id}/default`);
  return data.address;
}