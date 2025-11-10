// CareersPage.tsx
import React from "react";
import "../css/Careers.css";

const CareersPage: React.FC = () => {
  return (
    <div className="careers-page">
      <section className="careers-hero">
        <div>
          <p className="careers-eyebrow">Join the Marketplace Team</p>
          <h1>Careers at AniThrift</h1>
          <p>
            We’re thrilled you’re interested in joining our team. AniThrift is growing,
            and we believe that a strong team is the foundation of our success. We're dedicated
            to creating an inclusive, supportive, and innovative work environment where every
            teammate feels valued and inspired.
          </p>
        </div>
        <div className="careers-hero-badge" aria-hidden="true" />
      </section>

      <section className="careers-message">
        <h2>Be Part of Our Future</h2>
        <p>
          While we may not have open roles at the moment, we're always on the lookout for talented
          and passionate individuals. As we continue to expand, new opportunities will arise across
          product, community, design, and operations.
        </p>
        <p>
          If you're eager to contribute to our journey and make a meaningful impact,
          we would love to hear from you. Feel free to check back soon or send your resume
          and a note about how you can help AniThrift grow.
        </p>
      </section>

      <section className="careers-contact">
        <p className="careers-contact-label">Reach out anytime:</p>
        <a href="mailto:careers@ourcompany.com" className="careers-contact-email">
          careers@ourcompany.com
        </a>
      </section>

      <section className="careers-commitment">
        <h2>Our Commitment</h2>
        <p>
          We’re committed to fostering diversity, equity, and inclusion at every level of AniThrift.
          We invest in personal growth, offer paths for advancement, and build tools that empower a vibrant,
          global anime community. Join us, and let’s build something extraordinary together.
        </p>
      </section>
    </div>
  );
};

export default CareersPage;
