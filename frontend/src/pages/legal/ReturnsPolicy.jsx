import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { Section } from './LegalLayout';

/**
 * TEMPLATE — review with a qualified lawyer before publishing, especially
 * the consumer-rights wording for UK/EU. Replace [bracketed] values.
 */
export default function ReturnsPolicy() {
  return (
    <LegalLayout title="Returns & Refunds" updated="[Month Year]" path="/returns">
      <Section>
        <p>
          We want you to enjoy every cup. Because tea is a perishable consumable
          good, our returns are necessarily limited — but we stand fully behind
          the quality and condition of what we send.
        </p>
      </Section>

      <Section heading="Damaged, defective or incorrect orders">
        <p>
          If your order arrives damaged, defective, or is not what you ordered,
          contact us within [14] days of delivery at
          [support@chabuafirstleaf.com] with your order number and a photo. We
          will arrange a replacement or a full refund, including any return
          shipping where applicable.
        </p>
      </Section>

      <Section heading="Unopened items">
        <p>
          Unopened, unused items in their original sealed packaging may be
          eligible for return within [14] days. For food-safety reasons we
          cannot accept opened tea. Contact us before sending anything back so
          we can authorise the return.
        </p>
      </Section>

      <Section heading="Your statutory rights (UK/EU)">
        <p>
          Where the law gives you a right to cancel (for example, the
          14-day cooling-off period for distance sales in the UK and EU), that
          right is not affected by this policy. Note that sealed perishable
          goods may be exempt from cancellation once opened, as permitted by
          law. Nothing here limits your non-excludable consumer rights.
        </p>
      </Section>

      <Section heading="How refunds are issued">
        <p>
          Approved refunds are returned to your original payment method via
          Razorpay. Once processed, it may take several business days for your
          bank or card issuer to reflect the credit.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          To start a return or ask a question, email
          [support@chabuafirstleaf.com]. See also our{' '}
          <Link to="/shipping" className="text-brand-gold underline underline-offset-2">
            Shipping Policy
          </Link>{' '}
          and{' '}
          <Link to="/terms" className="text-brand-gold underline underline-offset-2">
            Terms of Service
          </Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}