import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Listing.css";
import FAQ from "../components/FAQ";

const Listing = () => {
  const navigate = useNavigate();

  return (
    <div className="listing-page">
      <section className="listing-hero">
        <div>
          <p className="listing-eyebrow">Sell with Confidence</p>
          <h1>Turn Your Passion Into Profit</h1>
          <p>
            AniThrift gives collectors the tools to list quickly, reach global buyers,
            and keep fandom treasures in circulation. It only takes a few steps to
            launch your storefront.
          </p>
          <div className="listing-hero-actions">
            <button onClick={() => navigate("/sell")} className="primary-link">
              Start Selling
            </button>
            <button onClick={() => navigate("/faq")} className="secondary-link">
              View Seller FAQ
            </button>
          </div>
        </div>
        <div className="listing-hero-badge" aria-hidden="true" />
      </section>

      <section className="listing-benefits">
        <div className="listing-section-header">
          <h2>Why Sellers Choose AniThrift</h2>
          <p>Build trust, reach serious fans, and earn more from every collectible.</p>
        </div>
        <div className="listing-benefits-grid">
          <article>
            <h3>Low Fees</h3>
            <p>
              It’s free to list. We only take a small percentage once your item sells,
              so you keep more of every transaction.
            </p>
          </article>
          <article>
            <h3>Verified Community</h3>
            <p>
              List alongside curated sellers and collectors. Ratings, messaging, and
              support tools keep deals safe.
            </p>
          </article>
          <article>
            <h3>Seller Analytics</h3>
            <p>
              Track views, saves, and conversions. Learn which tags and categories
              drive the most interest.
            </p>
          </article>
        </div>
      </section>

      <section className="listing-steps">
        <div className="listing-section-header">
          <h2>List in Three Simple Steps</h2>
          <p>No guesswork—our guided form walks you through the essentials.</p>
        </div>
        <div className="listing-steps-grid">
          <article>
            <div className="step-number">1</div>
            <h3>Add the Details</h3>
            <p>
              Enter the title, description, and condition. Link the item to its
              anime or game so the right buyers discover it.
            </p>
          </article>
          <article>
            <div className="step-number">2</div>
            <h3>Upload Photos</h3>
            <p>
              Showcase your collectible from every angle with crisp, well-lit photos.
              Highlight special features and packaging.
            </p>
          </article>
          <article>
            <div className="step-number">3</div>
            <h3>Publish or Save as Draft</h3>
            <p>
              Not ready yet? Save drafts to finish later. When it sells, AniThrift
              handles secure checkout and payouts through Stripe.
            </p>
          </article>
        </div>
      </section>

      <section className="listing-support">
        <div>
          <h2>Need a Hand?</h2>
          <p>
            From pricing tips to packaging best practices, our support center has
            everything you need to succeed.
          </p>
        </div>
        <FAQ />
      </section>
    </div>
  );
};

export default Listing;
