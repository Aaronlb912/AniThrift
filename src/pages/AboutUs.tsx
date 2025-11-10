import React from "react";
import "../css/AboutUs.css";

const AboutUsPage: React.FC = () => {
  return (
    <div className="about-us-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <p className="about-eyebrow">Our Story</p>
          <h1>Celebrating the Art of Fandom</h1>
          <p>
            AniThrift connects collectors, cosplayers, and creators across the globe.
            Born from a love of anime culture, we built a marketplace that makes it easy
            to sell treasures from your closet and discover new favorites from fellow fans.
          </p>
        </div>
        <div className="about-hero-image" aria-hidden="true" />
      </section>

      <section className="about-values-section">
        <div className="about-section-header">
          <h2>What Drives Us</h2>
          <p>Every feature we ship is rooted in the pillars that define AniThrift.</p>
        </div>
        <div className="about-values-grid">
          <article>
            <h3>Community First</h3>
            <p>
              We’re powered by the people who collect, trade, and celebrate anime every day.
              Safety, transparency, and inclusivity are built into every interaction.
            </p>
          </article>
          <article>
            <h3>Sustainable Fandom</h3>
            <p>
              Secondhand doesn’t mean second best. Extending the life of figures, manga,
              apparel, and merch keeps the magic alive while reducing waste.
            </p>
          </article>
          <article>
            <h3>Crafted for Collectors</h3>
            <p>
              From curated search to rich listings, we obsess over the details that matter
              to serious fans and first-time buyers alike.
            </p>
          </article>
        </div>
      </section>

      <section className="about-numbers-section">
        <div className="about-stat-card">
          <span className="stat-value">Coming soon</span>
          <span className="stat-label">Marketplace stories & milestones</span>
        </div>
        <div className="about-stat-card">
          <span className="stat-value">Coming soon</span>
          <span className="stat-label">Community impact highlights</span>
        </div>
        <div className="about-stat-card">
          <span className="stat-value">Coming soon</span>
          <span className="stat-label">Buyer and seller success metrics</span>
        </div>
      </section>

      <section className="about-cta-section">
        <div>
          <p className="about-eyebrow">Join the Marketplace</p>
          <h2>Turn fandom into community and creativity.</h2>
          <p>
            List your first item, build a storefront, or discover your next obsession.
            AniThrift makes it effortless to share the stories behind every collectible.
          </p>
        </div>
        <div className="about-cta-actions">
          <a href="/listing" className="primary-link">
            Start Selling
          </a>
          <a href="/search" className="secondary-link">
            Explore Listings
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
