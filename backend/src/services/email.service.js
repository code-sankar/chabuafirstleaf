/**
 * Email service — wraps the Resend API.
 *
 * If RESEND_API_KEY is not configured, every function logs and resolves
 * quietly rather than throwing — emails should never block the checkout
 * flow. Set RESEND_API_KEY and RESEND_FROM_EMAIL in your .env to enable.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Chabua First Leaf <orders@chabuafirstleaf.com>';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn(`[Resend] Not configured — skipping email "${subject}" to ${to}`);
    return { skipped: true };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[Resend] Failed to send "${subject}" to ${to}:`, body);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error(`[Resend] Error sending "${subject}" to ${to}:`, err.message);
    return { success: false };
  }
}

/* ─── Shared brand styling ────────────────────────────────────── */
const BRAND_COLORS = {
  forest: '#0F2E25',
  cream: '#F5F0E6',
  gold: '#C8A96B',
  charcoal: '#1D1D1D',
};

function wrapper(bodyHtml) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background-color: ${BRAND_COLORS.cream}; padding: 40px 20px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(15,46,37,0.08);">
      <div style="background-color: ${BRAND_COLORS.forest}; padding: 32px 40px; text-align: center;">
        <span style="font-size: 18px; letter-spacing: 4px; color: ${BRAND_COLORS.cream}; font-weight: 300;">
          CHABUA <span style="color: ${BRAND_COLORS.gold}; opacity: 0.5;">·</span> FIRST LEAF
        </span>
      </div>
      <div style="padding: 40px; color: ${BRAND_COLORS.charcoal};">
        ${bodyHtml}
      </div>
      <div style="padding: 24px 40px; border-top: 1px solid rgba(15,46,37,0.06); text-align: center;">
        <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(29,29,29,0.35); margin: 0;">
          Est. 1837 · Chabua, Assam · Where India's Tea Story Began
        </p>
      </div>
    </div>
  </div>`;
}

/* ─── Order confirmation ──────────────────────────────────────── */

/**
 * order: { order_number, customer_name, customer_email, total_amount, currency,
 *          shipping_address, estimated_delivery }
 * items: [{ product_name, quantity, price_at_purchase }]
 */
export async function sendOrderConfirmationEmail(order, items) {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid rgba(15,46,37,0.05); font-size: 14px;">
        ${item.product_name || 'Tea Reserve'} × ${item.quantity}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid rgba(15,46,37,0.05); font-size: 14px; text-align: right;">
        ${formatAmount(item.price_at_purchase * item.quantity, order.currency)}
      </td>
    </tr>`).join('');

  const addr = order.shipping_address || {};

  const html = wrapper(`
    <p style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: ${BRAND_COLORS.gold}; margin: 0 0 12px;">
      Order Confirmed
    </p>
    <h1 style="font-size: 26px; font-weight: 400; margin: 0 0 16px; letter-spacing: 0.5px;">
      Thank you for choosing<br/>Chabua First Leaf
    </h1>
    <p style="font-style: italic; color: rgba(29,29,29,0.6); line-height: 1.6; margin: 0 0 28px;">
      Your tea is now being prepared from the historic tea-growing region of Chabua, Assam.
      You will receive shipping updates as your order progresses.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(29,29,29,0.4); padding-bottom: 4px;">Order Number</td>
      </tr>
      <tr>
        <td style="font-size: 20px; letter-spacing: 1px; padding-bottom: 20px;">${order.order_number}</td>
      </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      ${itemRows}
      <tr>
        <td style="padding: 14px 0 0; font-size: 14px; font-weight: bold;">Total Paid</td>
        <td style="padding: 14px 0 0; font-size: 18px; font-weight: bold; text-align: right;">
          ${formatAmount(order.total_amount, order.currency)}
        </td>
      </tr>
    </table>

    <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(29,29,29,0.4); margin: 0 0 6px;">
      Shipping To
    </p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      ${order.customer_name}<br/>
      ${addr.street || addr.address || ''}<br/>
      ${addr.city || ''}, ${addr.state || ''} ${addr.zip || addr.postalCode || ''}<br/>
      ${addr.country || ''}
    </p>

    ${order.estimated_delivery ? `
    <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(29,29,29,0.4); margin: 0 0 6px;">
      Estimated Delivery
    </p>
    <p style="font-size: 14px; margin: 0;">${order.estimated_delivery}</p>
    ` : ''}
  `);

  return sendEmail({
    to: order.customer_email,
    subject: 'Your Chabua First Leaf Order Has Been Confirmed',
    html,
  });
}

/* ─── Guest account activation ────────────────────────────────── */

export async function sendAccountActivationEmail(email, name, actionLink) {
  const html = wrapper(`
    <p style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: ${BRAND_COLORS.gold}; margin: 0 0 12px;">
      Welcome
    </p>
    <h1 style="font-size: 26px; font-weight: 400; margin: 0 0 16px;">
      An account has been<br/>created for you
    </h1>
    <p style="font-style: italic; color: rgba(29,29,29,0.6); line-height: 1.6; margin: 0 0 28px;">
      Hello ${name || 'there'} — since you placed an order with us, we've created an
      account so you can track this order and any future reserves. Set a password
      to access your account.
    </p>
    <a href="${actionLink}" style="display: inline-block; background: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.forest}; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">
      Set Your Password
    </a>
  `);

  return sendEmail({
    to: email,
    subject: 'Your Chabua First Leaf Account',
    html,
  });
}

/* ─── Shipping notification ───────────────────────────────────── */

export async function sendShippingNotificationEmail(order, tracking) {
  const html = wrapper(`
    <p style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: ${BRAND_COLORS.gold}; margin: 0 0 12px;">
      On Its Way
    </p>
    <h1 style="font-size: 26px; font-weight: 400; margin: 0 0 16px;">
      Your order has shipped
    </h1>
    <p style="font-style: italic; color: rgba(29,29,29,0.6); line-height: 1.6; margin: 0 0 28px;">
      Order ${order.order_number} is on its way to you from the Chabua estate.
    </p>
    ${tracking?.trackingNumber ? `
    <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(29,29,29,0.4); margin: 0 0 6px;">
      Tracking Number
    </p>
    <p style="font-size: 16px; margin: 0 0 20px;">${tracking.trackingNumber}</p>
    ` : ''}
    ${tracking?.trackingUrl ? `
    <a href="${tracking.trackingUrl}" style="display: inline-block; background: ${BRAND_COLORS.gold}; color: ${BRAND_COLORS.forest}; text-decoration: none; padding: 14px 32px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">
      Track Your Order
    </a>
    ` : ''}
  `);

  return sendEmail({
    to: order.customer_email,
    subject: `Your Chabua First Leaf Order Has Shipped — ${order.order_number}`,
    html,
  });
}

/* ─── Helpers ──────────────────────────────────────────────────── */

function formatAmount(amount, currency = 'INR') {
  const symbols = { INR: '₹', USD: '$', GBP: '£', EUR: '€', AED: 'AED ' };
  const symbol = symbols[currency] || '';
  const isIntegerCurrency = currency === 'INR' || currency === 'AED';
  return `${symbol}${Number(amount).toFixed(isIntegerCurrency ? 0 : 2)}`;
}