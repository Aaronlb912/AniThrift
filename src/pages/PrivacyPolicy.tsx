import React from "react";
import "../css/infoPages.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Privacy Policy</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Information We Collect</h2>
        <h3>Personal Information</h3>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Name and contact information</li>
          <li>Account credentials</li>
          <li>Payment information</li>
        </ul>
        <h3>Automatically Collected Information</h3>
        <p>We automatically collect certain information when you use our service:</p>
        <ul>
          <li>Device information</li>
          <li>Usage data</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our service</li>
          <li>Process transactions</li>
          <li>Send you updates and communications</li>
          <li>Improve our service</li>
          <li>Comply with legal obligations</li>
        </ul>
        <h2>3. Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share your
          information only in the following circumstances:
        </p>
        <ul>
          <li>With your consent</li>
          <li>To service providers who assist us</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
        </ul>
        <h2>4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal
          information. However, no method of transmission over the internet is
          100% secure.
        </p>
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of certain communications</li>
        </ul>
        <h2>6. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@anithrift.com">privacy@anithrift.com</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

