// HelpAndSupportPage.tsx
import React from "react";
import "../css/HelpAndSupport.css"; // Adjust the import path as needed

const HelpAndSupportPage: React.FC = () => {
  return (
    <div className="help-container">
      <h1>Help & Support</h1>
      <p>
        Got a question? We've got answers. If you have some other questions, see
        our support center.
      </p>
      <ul>
        <li>
          <a href="/faq">FAQ</a>
        </li>
        <li>
          <a href="/contact-us">Contact Us</a>
        </li>
        <li>
          <a href="/terms-and-conditions">Terms and Conditions</a>
        </li>
      </ul>
      <p>
        Can't find what you're looking for? Email our support team at{" "}
        <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>
      </p>
    </div>
  );
};

export default HelpAndSupportPage;
