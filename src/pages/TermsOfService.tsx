import React from "react";
import "../css/infoPages.css";

const TermsOfService: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Terms of Service</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using AniThrift, you accept and agree to be bound
          by the terms and provision of this agreement.
        </p>
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use AniThrift for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title.
        </p>
        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account and password. You agree to accept responsibility for all
          activities that occur under your account.
        </p>
        <h2>4. Prohibited Uses</h2>
        <p>You may not use our service:</p>
        <ul>
          <li>For any unlawful purpose</li>
          <li>To violate any laws or regulations</li>
          <li>To infringe upon the rights of others</li>
          <li>To transmit harmful or malicious code</li>
          <li>To spam or harass other users</li>
        </ul>
        <h2>5. Seller Responsibilities</h2>
        <p>
          Sellers are responsible for accurately describing items, shipping
          products as described, and handling customer service inquiries.
        </p>
        <h2>6. Buyer Responsibilities</h2>
        <p>
          Buyers are responsible for reviewing item descriptions, making timely
          payments, and providing accurate shipping information.
        </p>
        <h2>7. Limitation of Liability</h2>
        <p>
          AniThrift shall not be liable for any indirect, incidental, special,
          or consequential damages resulting from the use or inability to use the
          service.
        </p>
        <h2>8. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Your continued
          use of the service constitutes acceptance of any changes.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;

