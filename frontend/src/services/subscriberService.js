import api from './api';

/**
 * Subscriber service — newsletter / waitlist signups and admin listing.
 * Routes through the backend so validation, dedupe, and future welcome
 * emails are handled server-side, not via a direct browser→DB write.
 */
export async function subscribe({ name, email }) {
  const { data } = await api.post('/api/subscribers/subscribe', { name, email });
  return data; // { success, message, data: { id, name, created_at } }
}

export async function listSubscribers() {
  const { data } = await api.get('/api/subscribers'); // admin-only
  return data.subscribers || [];
}