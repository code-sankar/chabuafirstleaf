import api from './api.js';

/**
 * Admin service — single surface for all /admin/* endpoints.
 *
 *   Uses the shared `api` axios instance, so the Supabase access token
 *   is automatically attached. The backend admin routes don't currently
 *   enforce token-based gating (the AdminGate page-level check guards
 *   access), but every call here is auth-ready for the day that lands.
 */

/* ─── Orders ─────────────────────────────────────────────────── */

export async function listOrders({ limit = 100 } = {}) {
  const { data } = await api.get('/api/orders/admin/list', { params: { limit } });
  return data; // { success, orders: [...] }
}

export async function updateOrderStatus(orderId, status) {
  const { data } = await api.patch(
    `/api/orders/admin/orders/${orderId}/status`,
    { status }
  );
  return data; // { success, updatedStatus, shipping? }
}

export async function refundOrder(orderId, { amount, reason } = {}) {
  const body = {};
  if (amount != null) body.amount = amount;
  if (reason) body.reason = reason;

  const { data } = await api.post(
    `/api/orders/admin/orders/${orderId}/refund`,
    body
  );
  return data; // { success, refund: { id, amount, status } }
}

/* ─── Customers ──────────────────────────────────────────────── */

export async function listCustomers() {
  const { data } = await api.get('/api/orders/admin/customers');
  return data; // { success, customers: [...], total }
}

/* ─── Analytics ──────────────────────────────────────────────── */

export async function getAnalytics() {
  const { data } = await api.get('/api/orders/admin/analytics');
  return data; // { success, analytics: { ... } }
}