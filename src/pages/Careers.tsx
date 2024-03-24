// CareersPage.tsx
import React from "react";
import "../css/Careers.css"; // Make sure to create and style accordingly

const CareersPage: React.FC = () => {
  return (
    <div className="careers-container">
      <h1>Careers at Our Company</h1>
      <p>
        We're thrilled you're interested in joining our team. Our company is growing, and we believe that a strong team is the foundation of our success. We're dedicated to creating an inclusive, supportive, and innovative work environment where every team member feels valued and inspired.
      </p>
      <h2>Be Part of Our Future</h2>
      <p>
        While we may not have open positions at the moment, we're always on the lookout for talented and passionate individuals. As we continue to expand, new opportunities will arise in various areas of our business.
      </p>
      <p>
        If you're eager to contribute to our journey and make a significant impact, we would love to hear from you. We encourage you to check back in the future or reach out to us with your resume and a cover letter explaining how you can contribute to our team. 
      </p>
      <p className="contact-info">
        Please send your applications to <a href="mailto:careers@ourcompany.com">careers@ourcompany.com</a>.
      </p>
      <h2>Our Commitment</h2>
      <p>
        We're committed to fostering diversity, equity, and inclusion at every level of our organization. We believe in investing in our employees' professional growth and offering paths for advancement. Join us, and let's build something great together.
      </p>
    </div>
  );
};

export default CareersPage;
