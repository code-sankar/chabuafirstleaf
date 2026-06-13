/**
 * Shiprocket service — creates shipments and generates tracking numbers.
 *
 *   - Auth tokens last ~10 days; we cache in-memory with a buffer
 *   - All public functions resolve to { success, ...data } or
 *     { success: false, error } so callers can degrade gracefully
 *   - If SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD aren't set, every call
 *     short-circuits with { success: false, error: 'not configured' }
 *     so admin actions don't break in dev
 */

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days (1-day buffer before expiry)

let tokenCache = { token: null, fetchedAt: 0 };

function isConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

async function getToken() {
  if (tokenCache.token && Date.now() - tokenCache.fetchedAt < TOKEN_TTL_MS) {
    return tokenCache.token;
  }

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shiprocket auth failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data?.token) throw new Error('Shiprocket auth returned no token');

  tokenCache = { token: data.token, fetchedAt: Date.now() };
  return data.token;
}

async function shiprocketRequest(path, options = {}) {
  const token = await getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || `Shiprocket ${path} failed (${response.status})`);
  }
  return body;
}

/* ─────────────────────────────────────────────────────────────────
 * createShipment — used when admin marks an order as Shipped.
 *
 *   1. Creates the order in Shiprocket (so it shows in their dashboard)
 *   2. Assigns an AWB code (the actual tracking number)
 *   3. Returns the tracking number + URL ready to be persisted to
 *      shipping_tracking and emailed to the customer
 *
 *   The Shiprocket account needs at least one Pickup Location configured
 *   (Shiprocket Dashboard → Settings → Company Setup → Pickup Address).
 *   Set its nickname in SHIPROCKET_PICKUP_LOCATION (default: "Primary").
 * ───────────────────────────────────────────────────────────────── */
export async function createShipment(order, items) {
  if (!isConfigured()) {
    return { success: false, error: 'Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env.' };
  }

  try {
    const addr = order.shipping_address || {};

    const payload = {
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      comment: 'Single-origin tea from the Chabua estate',
      billing_customer_name: (order.customer_name || '').split(' ').slice(0, -1).join(' ') || order.customer_name,
      billing_last_name: (order.customer_name || '').split(' ').slice(-1).join(' '),
      billing_address: addr.street || addr.address || '',
      billing_address_2: '',
      billing_city: addr.city || '',
      billing_pincode: addr.zip || addr.postalCode || '',
      billing_state: addr.state || '',
      billing_country: addr.country || '',
      billing_email: order.customer_email,
      billing_phone: order.customer_phone || '',
      shipping_is_billing: true,
      order_items: items.map((item) => ({
        name: item.product_name,
        sku: item.product_id?.slice(0, 50) || 'CFL-ITEM',
        units: item.quantity,
        selling_price: Number(item.price_at_purchase),
        discount: 0,
        tax: 0,
      })),
      payment_method: 'Prepaid',
      sub_total: Number(order.subtotal || order.total_amount),
      // Parcel dimensions — luxury tea is small. Adjust per your packaging.
      length: 15,
      breadth: 12,
      height: 8,
      weight: 0.5, // kg
    };

    /* Step 1: Create order in Shiprocket */
    const createRes = await shiprocketRequest('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const shipmentId = createRes?.shipment_id;
    if (!shipmentId) {
      return { success: false, error: 'Shiprocket order created but returned no shipment_id.' };
    }

    /* Step 2: Assign AWB (tracking number) */
    let awbCode = null;
    let courierName = null;
    try {
      const awbRes = await shiprocketRequest('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentId }),
      });
      awbCode = awbRes?.response?.data?.awb_code || null;
      courierName = awbRes?.response?.data?.courier_name || null;
    } catch (awbErr) {
      // AWB assignment can fail if no courier is available for the pincode.
      // The Shiprocket order is still created; admin can assign manually.
      console.warn(`[Shiprocket] AWB assignment failed for ${order.order_number}:`, awbErr.message);
    }

    return {
      success: true,
      shipmentId: String(shipmentId),
      awbCode,
      courierName,
      trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null,
    };
  } catch (err) {
    console.error('[Shiprocket] createShipment error:', err.message);
    return { success: false, error: err.message };
  }
}

/* Get the live tracking timeline (admin / future use) */
export async function getTracking(shipmentId) {
  if (!isConfigured()) {
    return { success: false, error: 'Shiprocket not configured.' };
  }
  try {
    const data = await shiprocketRequest(`/courier/track/shipment/${shipmentId}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}