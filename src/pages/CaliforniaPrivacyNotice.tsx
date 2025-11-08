import React from "react";
import "../css/infoPages.css";

const CaliforniaPrivacyNotice: React.FC = () => {
  return (
    <div className="info-page-container">
      <h1>California Privacy Notice</h1>
      <div className="info-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          This California Privacy Notice supplements our Privacy Policy and
          applies solely to California residents.
        </p>
        <h2>Your California Privacy Rights</h2>
        <p>
          Under the California Consumer Privacy Act (CCPA), California residents
          have the following rights:
        </p>
        <h3>Right to Know</h3>
        <p>
          You have the right to request information about the categories and
          specific pieces of personal information we collect, use, and disclose.
        </p>
        <h3>Right to Delete</h3>
        <p>
          You have the right to request deletion of your personal information,
          subject to certain exceptions.
        </p>
        <h3>Right to Opt-Out</h3>
        <p>
          You have the right to opt-out of the sale of your personal
          information. We do not sell personal information.
        </p>
        <h3>Right to Non-Discrimination</h3>
        <p>
          We will not discriminate against you for exercising your privacy
          rights.
        </p>
        <h2>How to Exercise Your Rights</h2>
        <p>
          To exercise your California privacy rights, please contact us at{" "}
          <a href="mailto:privacy@anithrift.com">privacy@anithrift.com</a> or
          visit our{" "}
          <a href="/settings/request-data">Request Your Data</a> page.
        </p>
        <h2>Categories of Personal Information</h2>
        <p>We collect the following categories of personal information:</p>
        <ul>
          <li>Identifiers (name, email, etc.)</li>
          <li>Commercial information</li>
          <li>Internet activity</li>
          <li>Geolocation data</li>
        </ul>
      </div>
    </div>
  );
};

export default CaliforniaPrivacyNotice;

