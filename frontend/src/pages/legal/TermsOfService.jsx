import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { Section } from './LegalLayout';

/**
 * TEMPLATE — review with a qualified lawyer before publishing.
 * Replace every [bracketed] value with your real details.
 */
export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" updated="[Month Year]" path="/terms">
      <Section>
        <p>
          These Terms govern your use of chabuafirstleaf.com and any purchase
          you make from [Legal Entity Name] (“Chabua First Leaf”, “we”, “us”).
          By using the site or placing an order, you agree to these Terms.
        </p>
      </Section>

      <Section heading="Ordering and acceptance">
        <p>
          Your order is an offer to purchase. A contract is formed only when we
          confirm your order by email. We may decline or cancel an order — for
          example, if an item is unavailable, a pricing error has occurred, or
          we cannot verify payment — and will refund any amount already charged.
        </p>
      </Section>

      <Section heading="Pricing and payment">
        <p>
          Prices are shown in the currency indicated at checkout and may change
          without notice, though changes do not affect orders already confirmed.
          Payment is processed securely through Razorpay. Where applicable,
          import duties and taxes for international orders are the
          responsibility of the recipient unless stated otherwise.
        </p>
      </Section>

      <Section heading="Shipping and delivery">
        <p>
          Delivery timelines are estimates, not guarantees. Risk passes to you
          on delivery. Full details are in our{' '}
          <Link to="/shipping" className="text-brand-gold underline underline-offset-2">
            Shipping Policy
          </Link>.
        </p>
      </Section>

      <Section heading="Returns">
        <p>
          Because our teas are perishable consumable goods, returns are limited.
          Please see our{' '}
          <Link to="/returns" className="text-brand-gold underline underline-offset-2">
            Returns Policy
          </Link>{' '}
          for what we can and cannot accept, and for your statutory rights.
        </p>
      </Section>

      <Section heading="Intellectual property">
        <p>
          All content on this site — text, imagery, the Chabua First Leaf name
          and marks, and design — belongs to us or our licensors and may not be
          reproduced without written permission.
        </p>
      </Section>

      <Section heading="Limitation of liability">
        <p>
          Nothing in these Terms excludes liability that cannot be excluded by
          law, including for death or personal injury caused by negligence or
          for fraud. Subject to that, our total liability arising from an order
          is limited to the amount you paid for it.
        </p>
      </Section>

      <Section heading="Governing law">
        <p>
          These Terms are governed by the laws of [jurisdiction], and disputes
          are subject to the courts of [jurisdiction], without affecting any
          mandatory consumer-protection rights you have where you live.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these Terms? Email [support@chabuafirstleaf.com].
        </p>
      </Section>
    </LegalLayout>
  );
}