import api from './api';

/**
 * Order service — every customer-facing order call lives here.
 *
 * Two flows are supported:
 *   1. Guest checkout — items + customer details are sent; the server
 *      creates a Razorpay order and returns the orderId + amount.
 *   2. Authenticated checkout — same payload, but the server attaches
 *      the authenticated user_id from the Bearer token.
 */

/* ─── Checkout (used by CheckoutPage / PaymentStep) ─────────── */

export async function initiateCheckout({ items, customerDetails, currency = 'INR' }) {
  const { data } = await api.post('/api/orders/checkout/initiate', {
    items,
    customerDetails,
    currency,
  });
  return data; // { razorpayOrderId, amount, currency, breakdown }
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  items,
  customerDetails,
}) {
  const { data } = await api.post('/api/orders/checkout/verify', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    customerDetails,
  });
  return data; // { success, orderNumber, orderId }
}

/* ─── Authenticated order history ──────────────────────────── */

export async function getMyOrders({ limit = 20, offset = 0 } = {}) {
  const { data } = await api.get('/api/orders/me', { params: { limit, offset } });
  return data; // { orders: [...], total }
}

export async function getOrderById(orderId) {
  const { data } = await api.get(`/api/orders/${orderId}`);
  return data; // { order, items, tracking }
}

/* ─── Guest order tracking (no auth required) ──────────────── */

export async function trackOrderByNumber({ orderNumber, email }) {
  const { data } = await api.post('/api/orders/track', { orderNumber, email });
  return data; // { order, tracking }
}