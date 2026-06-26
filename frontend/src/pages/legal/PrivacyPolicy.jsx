import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { Section } from './LegalLayout';

/**
 * TEMPLATE — review with a qualified lawyer before publishing.
 * Replace every [bracketed] value with your real details. Written to be
 * GDPR/UK-GDPR aware since the brand targets the UK, EU, UAE and US.
 */
export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="[Month Year]" path="/privacy">
      <Section>
        <p>
          This Privacy Policy explains how [Legal Entity Name] (“Chabua First
          Leaf”, “we”, “us”) collects, uses, and protects your personal
          information when you visit chabuafirstleaf.com or place an order with
          us. We are the data controller for the information described here.
        </p>
      </Section>

      <Section heading="Information we collect">
        <p>
          We collect information you provide directly — your name, email
          address, shipping and billing address, and phone number — when you
          create an account, place an order, or join our waitlist. We also
          collect limited technical information automatically, such as your IP
          address, device and browser type, and how you use the site.
        </p>
        <p>
          We do not store your full card details. Payments are processed
          securely by Razorpay, which handles your payment information under its
          own privacy terms.
        </p>
      </Section>

      <Section heading="How we use your information">
        <p>
          We use your information to process and deliver your orders, provide
          customer support, send transactional emails (order confirmations and
          shipping updates), and — only where you have consented — send
          occasional updates about new releases. We also use aggregated,
          non-identifying analytics to improve the site.
        </p>
      </Section>

      <Section heading="Legal bases for processing (UK/EU)">
        <p>
          Where the UK GDPR or EU GDPR applies, we rely on the following legal
          bases: performance of a contract (to fulfil your order), legitimate
          interests (to operate and secure the site), consent (for optional
          marketing and non-essential cookies), and legal obligation (to keep
          tax and transaction records).
        </p>
      </Section>

      <Section heading="Sharing your information">
        <p>
          We share information only with the service providers needed to run the
          business: Razorpay (payments), Shiprocket and our carriers (delivery),
          Resend (transactional email), and Supabase (secure data hosting). Each
          processes data on our behalf under appropriate safeguards. We never
          sell your personal information.
        </p>
      </Section>

      <Section heading="International transfers">
        <p>
          Your information may be processed outside your country of residence,
          including in India, where we operate. Where required, we use
          appropriate safeguards such as Standard Contractual Clauses for
          transfers out of the UK or EEA.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          Depending on where you live, you may have the right to access,
          correct, delete, or port your data, to object to or restrict certain
          processing, and to withdraw consent at any time. To exercise any of
          these, contact us at [privacy@chabuafirstleaf.com]. You also have the
          right to complain to your local data protection authority (in the UK,
          the Information Commissioner’s Office).
        </p>
      </Section>

      <Section heading="Cookies">
        <p>
          We use essential cookies to make the site function and, with your
          consent, optional cookies to understand usage. You can manage your
          choice at any time through the cookie banner. See the cookie notice
          for details.
        </p>
      </Section>

      <Section heading="Data retention">
        <p>
          We keep order and transaction records for as long as required by law
          (typically for tax purposes), and account data for as long as your
          account is active. You may request deletion of data we are not
          legally required to retain.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about this policy or your data? Email us at
          [privacy@chabuafirstleaf.com] or write to [Legal Entity Name,
          registered address]. See also our{' '}
          <Link to="/terms" className="text-brand-gold underline underline-offset-2">
            Terms of Service
          </Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}