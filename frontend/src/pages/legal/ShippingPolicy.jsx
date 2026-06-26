import React from 'react';
import LegalLayout, { Section } from './LegalLayout';

/**
 * TEMPLATE — confirm every figure against your real Shiprocket / carrier
 * rates and timelines before publishing. Replace [bracketed] values.
 */
export default function ShippingPolicy() {
  return (
    <LegalLayout title="Shipping" updated="[Month Year]" path="/shipping">
      <Section>
        <p>
          We ship our teas worldwide from Assam, India, with particular care for
          our customers in the United Kingdom, United States, UAE, and Europe.
          Each order is packed to preserve freshness in transit.
        </p>
      </Section>

      <Section heading="Processing time">
        <p>
          Orders are prepared and dispatched within [1–3] business days. You
          will receive a shipping confirmation with tracking once your order
          leaves our estate.
        </p>
      </Section>

      <Section heading="Delivery estimates">
        <p>
          Typical delivery windows after dispatch are approximately: United
          Kingdom and Europe [X–Y] business days, United States [X–Y] business
          days, UAE [X–Y] business days, and within India [X–Y] business days.
          These are estimates and may vary with customs and carrier conditions.
        </p>
      </Section>

      <Section heading="Shipping cost">
        <p>
          Shipping is complimentary on orders over [USD 200]. Below that
          threshold a flat rate of [USD 15] applies. The exact amount is shown
          at checkout before you pay.
        </p>
      </Section>

      <Section heading="Customs, duties and taxes">
        <p>
          International orders may be subject to import duties and taxes levied
          by the destination country. Unless stated otherwise at checkout, these
          are the recipient’s responsibility and are not included in the price
          or shipping cost. We recommend checking your local thresholds.
        </p>
      </Section>

      <Section heading="Tracking">
        <p>
          Every shipment includes tracking. You can follow your order from the
          link in your shipping email, or by entering your order number on our
          order-tracking page.
        </p>
      </Section>

      <Section heading="Lost or delayed parcels">
        <p>
          If your order has not arrived within the estimated window, contact us
          at [support@chabuafirstleaf.com] and we will investigate with the
          carrier and make it right.
        </p>
      </Section>
    </LegalLayout>
  );
}