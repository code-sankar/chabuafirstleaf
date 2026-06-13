import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

/**
 * Razorpay webhook handler.
 *
 *   Razorpay POSTs webhook events for every payment lifecycle change.
 *   The frontend's /checkout/verify call is the primary path that records
 *   a successful payment — this endpoint is the BACKSTOP for cases where
 *   the customer closed their browser before verify completed, plus the
 *   only path for async events (refunds, post-checkout failures).
 *
 *   IMPORTANT: this route uses a RAW BODY parser (see server.js) because
 *   signature verification needs the exact unparsed bytes.
 *
 *   Configure in Razorpay Dashboard → Settings → Webhooks:
 *     URL:     https://yourdomain.com/api/webhooks/razorpay
 *     Events:  payment.captured, payment.failed,
 *              refund.processed, refund.failed
 *     Secret:  any random string → put it in RAZORPAY_WEBHOOK_SECRET
 */

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured.');
      return res.status(503).json({ success: false, error: 'Webhook handler not configured.' });
    }

    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing signature header.' });
    }

    // req.body is a Buffer here because of express.raw() — keep it raw for signature check
    const rawBody = req.body;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Webhook] Signature mismatch — rejected.');
      return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
    }

    // Signature is valid — now parse the JSON
    const event = JSON.parse(rawBody.toString('utf8'));
    const eventType = event?.event;

    console.log(`[Webhook] Received ${eventType}`);

    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event);
        break;
      case 'refund.failed':
        await handleRefundFailed(event);
        break;
      default:
        // Razorpay sends many event types — silently ignore the ones we don't handle.
        break;
    }

    // Always 200 to Razorpay so they don't retry. Errors are logged.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook] Handler error:', err);
    // Still 200 — Razorpay retries on non-2xx, which can amplify problems.
    return res.status(200).json({ received: true, error: err.message });
  }
};

/* ─── Event handlers ─────────────────────────────────────────── */

async function handlePaymentCaptured(event) {
  const payment = event?.payload?.payment?.entity;
  if (!payment) return;

  // Idempotent: only mark captured if not already done by /checkout/verify
  const { data: paymentRow } = await supabase
    .from('payments')
    .select('id, status')
    .eq('razorpay_order_id', payment.order_id)
    .maybeSingle();

  if (paymentRow && paymentRow.status !== 'captured') {
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id: payment.id,
        status: 'captured',
      })
      .eq('razorpay_order_id', payment.order_id);
    console.log(`[Webhook] Payment ${payment.id} reconciled via webhook.`);
  }
}

async function handlePaymentFailed(event) {
  const payment = event?.payload?.payment?.entity;
  if (!payment) return;

  await supabase
    .from('payments')
    .update({
      razorpay_payment_id: payment.id,
      status: 'failed',
    })
    .eq('razorpay_order_id', payment.order_id);

  console.log(`[Webhook] Payment ${payment.id} marked as failed.`);
}

async function handleRefundProcessed(event) {
  const refund = event?.payload?.refund?.entity;
  if (!refund) return;

  // Look up the original payment to find the order
  const { data: paymentRow } = await supabase
    .from('payments')
    .select('id, order_id')
    .eq('razorpay_payment_id', refund.payment_id)
    .maybeSingle();

  await supabase
    .from('refunds')
    .upsert(
      {
        razorpay_refund_id: refund.id,
        razorpay_payment_id: refund.payment_id,
        order_id: paymentRow?.order_id || null,
        payment_id: paymentRow?.id || null,
        amount_paise: refund.amount,
        reason: refund.notes?.reason || null,
        status: 'processed',
        processed_at: new Date().toISOString(),
      },
      { onConflict: 'razorpay_refund_id' }
    );

  // Update the order status. Full refund → Refunded, partial → Refunded as well
  // (we keep it simple; admins can review).
  if (paymentRow?.order_id) {
    await supabase
      .from('orders')
      .update({ status: 'Refunded' })
      .eq('id', paymentRow.order_id);
    console.log(`[Webhook] Order ${paymentRow.order_id} marked as Refunded.`);
  }
}

async function handleRefundFailed(event) {
  const refund = event?.payload?.refund?.entity;
  if (!refund) return;

  await supabase
    .from('refunds')
    .update({ status: 'failed' })
    .eq('razorpay_refund_id', refund.id);

  console.error(`[Webhook] Refund ${refund.id} failed.`);
}