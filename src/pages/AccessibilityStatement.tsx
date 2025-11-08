import React from "react";
import "../css/infoPages.css";

const AccessibilityStatement: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>Accessibility Statement</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>Our Commitment</h2>
        <p>
          AniThrift is committed to ensuring digital accessibility for people
          with disabilities. We are continually improving the user experience
          for everyone and applying the relevant accessibility standards.
        </p>
        <h2>Accessibility Standards</h2>
        <p>
          We aim to conform to the Web Content Accessibility Guidelines (WCAG)
          2.1 level AA standards. These guidelines explain how to make web
          content more accessible for people with disabilities.
        </p>
        <h2>Accessibility Features</h2>
        <ul>
          <li>Keyboard navigation support</li>
          <li>Screen reader compatibility</li>
          <li>Alt text for images</li>
          <li>High contrast mode support</li>
          <li>Text resizing capabilities</li>
        </ul>
        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of AniThrift. If you
          encounter accessibility barriers, please contact us at{" "}
          <a href="mailto:accessibility@anithrift.com">
            accessibility@anithrift.com
          </a>
        </p>
        <h2>Ongoing Efforts</h2>
        <p>
          We are actively working to improve accessibility across our platform.
          This is an ongoing effort, and we appreciate your patience as we
          continue to enhance the user experience for all visitors.
        </p>
      </div>
    </div>
  );
};

export default AccessibilityStatement;

