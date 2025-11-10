// HelpAndSupportPage.tsx
import React from "react";
import "../css/HelpAndSupport.css";

const HelpAndSupportPage: React.FC = () => {
  return (
    <div className="help-page">
      <section className="help-hero">
        <div>
          <p className="help-eyebrow">We’re here for you</p>
          <h1>Help & Support</h1>
          <p>
            Got a question? We’ve got answers. Explore our support center to find
            the resources you need, or reach out and we’ll point you in the right direction.
          </p>
        </div>
        <div className="help-hero-badge" aria-hidden="true" />
      </section>

      <section className="help-grid">
        <article>
          <h2>Browse FAQs</h2>
          <p>
            Dive into our most common questions about buying, selling, shipping,
            and account management.
          </p>
          <a href="/faq" className="help-link">
            Visit the FAQ
          </a>
        </article>
        <article>
          <h2>Share Feedback</h2>
          <p>
            Need a hand from the AniThrift team? Tell us how we can help and we’ll get back to you soon.
          </p>
          <a href="/feedback" className="help-link">
            Submit Feedback
          </a>
        </article>
        <article>
          <h2>Policies & Guidelines</h2>
          <p>
            Understand the rules that keep AniThrift safe and welcoming for everyone in the community.
          </p>
          <a href="/terms-and-conditions" className="help-link">
            Terms & Conditions
          </a>
        </article>
      </section>

      <section className="help-contact-banner">
        <div>
          <h2>Can’t find what you’re looking for?</h2>
          <p>
            Our support team is always ready to help. Send us a note and we’ll answer within 24 hours.
          </p>
        </div>
        <a href="mailto:support@yourcompany.com" className="primary-link">
          support@yourcompany.com
        </a>
      </section>
    </div>
  );
};

export default HelpAndSupportPage;
