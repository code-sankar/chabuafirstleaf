import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import {
  sendOrderConfirmationEmail,
  sendAccountActivationEmail,
  sendShippingNotificationEmail,
} from '../services/email.service.js';
import { getRate, usdToSmallestUnit } from '../services/fx.service.js';
import { createShipment } from '../services/shiprocket.service.js';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const VALID_STATUSES = [
  'Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded',
];

/* ─────────────────────────────────────────────────────────────────
 * 1. INITIATE CHECKOUT HANDSHAKE
 *    Server-side price validation, breakdown computation, Razorpay
 *    order creation. Uses live FX rate (with fallback).
 * ───────────────────────────────────────────────────────────────── */
export const initiateCheckoutHandshake = async (req, res, next) => {
  const { items } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'The allocation bag contains no line items.' });
    }

    let subtotalUSD = 0;

    for (const lineItem of items) {
      const { data: product, error: dbErr } = await supabase
        .from('products')
        .select('price, inventory_count, name')
        .eq('id', lineItem.id)
        .single();

      if (dbErr || !product) {
        return res.status(404).json({ success: false, error: `Product '${lineItem.id}' was not found.` });
      }

      if (product.inventory_count < lineItem.quantity) {
        return res.status(409).json({
          success: false,
          error: `Insufficient reserve allocations for '${product.name}'. Current stock: ${product.inventory_count}.`,
        });
      }

      subtotalUSD += Number(product.price) * lineItem.quantity;
    }

    // Cost breakdown — mirrors frontend ReviewStep.computeBreakdown()
    const shippingUSD = subtotalUSD >= 200 ? 0 : 15;
    const taxUSD = (subtotalUSD + shippingUSD) * 0.05;
    const totalUSD = subtotalUSD + shippingUSD + taxUSD;

    // Live FX → INR paise for Razorpay
    const totalAmountPaise = usdToSmallestUnit(totalUSD, 'INR');
    const rateUsed = getRate('INR');

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmountPaise,
      currency: 'INR',
      receipt: `rcpt_${crypto.randomBytes(4).toString('hex')}`,
    });

    await supabase.from('payments').insert([{
      razorpay_order_id: razorpayOrder.id,
      amount_paid_paise: totalAmountPaise,
      status: 'created',
      subtotal_usd: subtotalUSD,
      shipping_usd: shippingUSD,
      tax_usd: taxUSD,
      total_usd: totalUSD,
      notes: { fxRate: rateUsed, fxRateUsed: 'USD→INR' },
    }]);

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 2. VERIFY PAYMENT SIGNATURE & LOG THE ORDER
 * ───────────────────────────────────────────────────────────────── */
export const verifySecurePaymentSettlement = async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    customerDetails,
  } = req.body;

  try {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification parameters.' });
    }

    // ── Signature validation ─────────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Cryptographic signature mismatch. Settlement rejected.' });
    }

    // ── Duplicate protection ─────────────────────────────────────
    const { data: paymentRow, error: paymentLookupErr } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentLookupErr || !paymentRow) {
      return res.status(404).json({ success: false, error: 'No matching payment record was found for this order.' });
    }

    if (paymentRow.status === 'captured' && paymentRow.order_id) {
      // Already processed — return the existing order details (idempotent).
      // Returning here BEFORE the inventory decrement is important: it
      // guarantees stock is never reduced twice for the same payment.
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('order_number, id')
        .eq('id', paymentRow.order_id)
        .single();
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          orderNumber: existingOrder.order_number,
          orderId: existingOrder.id,
        });
      }
    }

    // ── Item snapshots ──────────────────────────────────────────
    // Build the line-item records using SERVER-side product data so the
    // recorded price/name/image cannot be tampered with by the client.
    // Stock is NOT mutated here — it is decremented atomically below,
    // after the order is persisted (see decrement_product_inventory).
    const itemRecordsPayload = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('price, name, images, weight')
        .eq('id', item.id)
        .single();

      itemRecordsPayload.push({
        product_id: item.id,
        quantity: item.quantity,
        // Trust the server price, fall back to client only if the row is gone.
        price_at_purchase: product?.price ?? item.price,
        product_name: product?.name || item.name,
        product_image: product?.images?.[0] || item.images?.[0] || null,
        product_weight: product?.weight || item.weight || null,
      });
    }

    // ── Order number: CFL-<year>-NNNNNN ───────────────────────────
    const { data: seqResult } = await supabase.rpc('get_next_order_seq_value');
    const sequence = seqResult || Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `CFL-${new Date().getFullYear()}-${String(sequence).padStart(6, '0')}`;

    const userId = req.user?.id || await resolveCustomerAccount(customerDetails);
    const estimatedDelivery = formatEstimatedDelivery();

    // ── Persist order ─────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: userId,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        subtotal: paymentRow.subtotal_usd,
        shipping: paymentRow.shipping_usd,
        tax: paymentRow.tax_usd,
        total_amount: paymentRow.total_usd,
        currency: 'USD',
        payment_method: 'Razorpay',
        status: 'Paid',
        shipping_address: customerDetails.addressBlock,
        estimated_delivery: estimatedDelivery,
      }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    await supabase.from('order_items').insert(
      itemRecordsPayload.map((rec) => ({ ...rec, order_id: order.id }))
    );

    await supabase
      .from('payments')
      .update({ razorpay_payment_id, razorpay_signature, status: 'captured', order_id: order.id })
      .eq('razorpay_order_id', razorpay_order_id);

    // ── Decrement inventory atomically (oversell-safe) ─────────────
    // The RPC locks each product row (SELECT ... FOR UPDATE), so two
    // simultaneous checkouts of the last unit are serialized and cannot
    // both succeed. Payment is already captured at this point, so a rare
    // shortfall does NOT fail the order — it is logged and the order is
    // flagged 'Processing' for an admin to reconcile.
    try {
      const { data: shortfalls, error: invErr } = await supabase.rpc(
        'decrement_product_inventory',
        { p_items: items.map((i) => ({ id: i.id, quantity: i.quantity })) }
      );

      if (invErr) {
        console.error('[Inventory] Decrement RPC failed:', invErr.message);
      } else if (Array.isArray(shortfalls) && shortfalls.length > 0) {
        console.warn(
          `[Inventory] Stock shortfall on paid order ${order.order_number}:`,
          JSON.stringify(shortfalls)
        );
        await supabase
          .from('orders')
          .update({ status: 'Processing' })
          .eq('id', order.id);
      }
    } catch (invCatch) {
      // Never let an inventory hiccup break a paid order's response.
      console.error('[Inventory] Unexpected decrement error:', invCatch.message);
    }

    sendOrderConfirmationEmail(order, itemRecordsPayload).catch((err) =>
      console.error('[Email] Order confirmation failed:', err.message)
    );

    return res.status(200).json({
      success: true,
      orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 3. GET MY ORDERS — with email-based backfill
 *    On the first call after sign-in, link any guest orders that match
 *    this user's email but have no user_id yet. Subsequent calls find
 *    zero rows to update so the overhead is one cheap query.
 * ───────────────────────────────────────────────────────────────── */
export const getMyOrders = async (req, res, next) => {
  try {
    // Backfill: link orphan guest orders by email
    await supabase
      .from('orders')
      .update({ user_id: req.user.id })
      .ilike('customer_email', req.user.email)
      .is('user_id', null);

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;

    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, orders: [], total: count || 0 });
    }

    const orderIds = orders.map((o) => o.id);
    const { data: allItems } = await supabase
      .from('order_items')
      .select('order_id, product_name, product_image, quantity')
      .in('order_id', orderIds);

    const itemsByOrder = groupItemsByOrder(allItems);
    const shaped = orders.map((o) => shapeOrderSummary(o, itemsByOrder[o.id] || []));

    return res.status(200).json({ success: true, orders: shaped, total: count || orders.length });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 4. GET ORDER BY ID
 * ───────────────────────────────────────────────────────────────── */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const detail = await buildOrderDetail(order);
    return res.status(200).json(detail);
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 5. TRACK ORDER (guest)
 * ───────────────────────────────────────────────────────────────── */
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      return res.status(400).json({ success: false, error: 'Order number and email are required.' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim())
      .ilike('customer_email', email.trim())
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: "We couldn't find an order matching those details." });
    }

    const detail = await buildOrderDetail(order);
    return res.status(200).json(detail);
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 6. ADMIN — LIST ORDERS
 * ───────────────────────────────────────────────────────────────── */
export const getAdminOrdersList = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, total_amount, currency, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const shaped = (orders || []).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      subtotal: Number(o.total_amount),
      currency: o.currency,
      status: o.status,
      created_at: o.created_at,
    }));

    return res.status(200).json({ success: true, orders: shaped });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 7. ADMIN — ANALYTICS
 * ───────────────────────────────────────────────────────────────── */
export const fetchAdminAnalyticsMatrix = async (req, res, next) => {
  try {
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('total_amount, status, created_at, customer_email');

    if (error) throw error;

    const nonCancelled = (allOrders || []).filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded');

    const totalRevenue = nonCancelled.reduce((sum, o) => sum + Number(o.total_amount), 0);

    const todayISO = new Date().toISOString().split('T')[0];
    const ordersToday = nonCancelled.filter((o) => o.created_at?.startsWith(todayISO)).length;

    const now = new Date();
    const monthlyRevenue = nonCancelled
      .filter((o) => {
        const d = new Date(o.created_at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const avgOrderValue = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0;
    const uniqueCustomers = new Set(nonCancelled.map((o) => o.customer_email)).size;

    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenueUSD: totalRevenue,
        ordersToday,
        monthlyRevenueUSD: monthlyRevenue,
        averageOrderValueUSD: avgOrderValue,
        totalCustomers: uniqueCustomers,
        totalOrders: nonCancelled.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 8. ADMIN — UPDATE ORDER STATUS
 *    When status → 'Shipped', auto-creates the Shiprocket shipment
 *    and emails the customer with tracking. Other status changes
 *    just update the field.
 * ───────────────────────────────────────────────────────────────── */
export const modifyOrderStatusByAdmin = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  try {
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error || !updatedOrder) throw error || new Error('Order not found.');

    // Side effect: Shipped → create Shiprocket shipment (best-effort, never blocks)
    let shipping = null;
    if (status === 'Shipped') {
      shipping = await triggerShipmentForOrder(updatedOrder);
    }

    return res.status(200).json({
      success: true,
      updatedStatus: updatedOrder.status,
      shipping,
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 9. ADMIN — PROCESS REFUND
 *    Creates a refund via Razorpay, records it in our refunds table.
 *    Razorpay then dispatches refund.processed webhook which marks
 *    the order as Refunded.
 * ───────────────────────────────────────────────────────────────── */
export const adminRefundOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const { amount, reason } = req.body || {};

  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, payments:payments!order_id(*)')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const payment = (order.payments || []).find((p) => p.status === 'captured');
    if (!payment?.razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'No captured payment found for this order.' });
    }

    // amount in INR rupees (UI-friendly); convert to paise for Razorpay
    const refundAmountPaise = amount
      ? Math.round(Number(amount) * 100)
      : payment.amount_paid_paise; // full refund

    if (refundAmountPaise <= 0 || refundAmountPaise > payment.amount_paid_paise) {
      return res.status(400).json({ success: false, error: 'Invalid refund amount.' });
    }

    const refund = await razorpayInstance.payments.refund(payment.razorpay_payment_id, {
      amount: refundAmountPaise,
      notes: { reason: reason || 'Admin-initiated refund' },
    });

    await supabase.from('refunds').insert([{
      order_id: orderId,
      payment_id: payment.id,
      razorpay_refund_id: refund.id,
      razorpay_payment_id: payment.razorpay_payment_id,
      amount_paise: refundAmountPaise,
      reason: reason || null,
      status: refund.status === 'processed' ? 'processed' : 'pending',
      processed_at: refund.status === 'processed' ? new Date().toISOString() : null,
    }]);

    // If Razorpay processed immediately, mark order Refunded now (webhook will
    // also fire and confirm — both paths are idempotent).
    if (refund.status === 'processed') {
      await supabase.from('orders').update({ status: 'Refunded' }).eq('id', orderId);
    }

    return res.status(200).json({
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmountPaise / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────
 * 10. ADMIN — CUSTOMERS LIST
 *     Aggregates orders by customer email. For 10k+ customers, move
 *     this to a Postgres view or RPC for performance.
 * ───────────────────────────────────────────────────────────────── */
export const getAdminCustomersList = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, customer_name, customer_phone, total_amount, created_at, status')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const customersMap = new Map();
    for (const order of orders || []) {
      const email = order.customer_email?.toLowerCase();
      if (!email) continue;

      const existing = customersMap.get(email) || {
        email,
        name: order.customer_name,
        phone: order.customer_phone,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: order.created_at,
        firstOrderAt: order.created_at,
      };

      if (order.status !== 'Cancelled') {
        existing.totalOrders += 1;
        existing.totalSpent += Number(order.total_amount || 0);
      }
      if (order.created_at > existing.lastOrderAt) existing.lastOrderAt = order.created_at;
      if (order.created_at < existing.firstOrderAt) existing.firstOrderAt = order.created_at;

      customersMap.set(email, existing);
    }

    const customers = Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

    return res.status(200).json({ success: true, customers, total: customers.length });
  } catch (error) {
    next(error);
  }
};

/* ════════════════════════════════════════════════════════════════
 * Internal helpers
 * ════════════════════════════════════════════════════════════════ */

async function resolveCustomerAccount(customerDetails) {
  try {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: customerDetails.email,
      email_confirm: false,
      user_metadata: {
        full_name: customerDetails.name,
        phone: customerDetails.phone,
      },
    });

    if (error) return null;

    const newUserId = created?.user?.id;

    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: customerDetails.email,
    });

    const actionLink = linkData?.properties?.action_link;
    if (actionLink) {
      sendAccountActivationEmail(customerDetails.email, customerDetails.name, actionLink).catch((err) =>
        console.error('[Email] Activation email failed:', err.message)
      );
    }

    return newUserId || null;
  } catch (err) {
    console.error('[Auth] Guest account resolution failed:', err.message);
    return null;
  }
}

async function triggerShipmentForOrder(order) {
  try {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const result = await createShipment(order, items || []);

    if (!result.success) {
      console.warn(`[Ship] Order ${order.order_number}: ${result.error}`);
      return { success: false, error: result.error };
    }

    // Persist tracking info
    await supabase
      .from('shipping_tracking')
      .upsert(
        {
          order_id: order.id,
          tracking_number: result.awbCode,
          tracking_url: result.trackingUrl,
          carrier: result.courierName,
          shiprocket_shipment_id: result.shipmentId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'order_id' }
      );

    // Email the customer (best-effort)
    sendShippingNotificationEmail(order, {
      trackingNumber: result.awbCode,
      trackingUrl: result.trackingUrl,
    }).catch((err) => console.error('[Email] Shipping notification failed:', err.message));

    return {
      success: true,
      trackingNumber: result.awbCode,
      trackingUrl: result.trackingUrl,
      courier: result.courierName,
    };
  } catch (err) {
    console.error('[Ship] triggerShipmentForOrder error:', err.message);
    return { success: false, error: err.message };
  }
}

function formatEstimatedDelivery() {
  const min = new Date();
  min.setDate(min.getDate() + 5);
  const max = new Date();
  max.setDate(max.getDate() + 7);

  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  return `${fmt(min)} – ${fmt(max)}`;
}

function groupItemsByOrder(items) {
  return (items || []).reduce((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {});
}

function shapeOrderSummary(order, itemPreviews) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    placedAt: order.created_at,
    totalAmount: Number(order.total_amount),
    currency: order.currency || 'USD',
    itemCount: itemPreviews.reduce((sum, i) => sum + i.quantity, 0),
    items: itemPreviews.map((i) => ({
      name: i.product_name,
      images: i.product_image ? [i.product_image] : [],
      quantity: i.quantity,
    })),
  };
}

async function buildOrderDetail(order) {
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const { data: tracking } = await supabase
    .from('shipping_tracking')
    .select('tracking_number, tracking_url, carrier')
    .eq('order_id', order.id)
    .maybeSingle();

  return {
    order: {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      placedAt: order.created_at,
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),
      tax: Number(order.tax || 0),
      totalAmount: Number(order.total_amount),
      currency: order.currency || 'USD',
      paymentMethod: order.payment_method,
      estimatedDelivery: order.estimated_delivery,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      shippingAddress: order.shipping_address,
      items: (items || []).map((i) => ({
        id: i.id,
        name: i.product_name,
        images: i.product_image ? [i.product_image] : [],
        weight: i.product_weight,
        quantity: i.quantity,
        lineTotal: Number(i.price_at_purchase) * i.quantity,
      })),
    },
    tracking: tracking
      ? {
          trackingNumber: tracking.tracking_number,
          trackingUrl: tracking.tracking_url,
          carrier: tracking.carrier,
        }
      : null,
  };
}