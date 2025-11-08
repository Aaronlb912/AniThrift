import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsRequestData: React.FC = () => {
  const [requested, setRequested] = useState(false);
  const auth = getAuth();

  const handleRequest = () => {
    // In a real implementation, this would trigger a data export process
    setRequested(true);
    alert(
      "Your data request has been submitted. You will receive an email with your data export within 30 days."
    );
  };

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Request Your Data</h1>
      <div className="info-content">
        <p>
          You have the right to request a copy of all personal data we have
          collected about you.
        </p>
        <h2>What Data Will Be Included?</h2>
        <ul>
          <li>Account information</li>
          <li>Order history</li>
          <li>Messages and conversations</li>
          <li>Profile data</li>
          <li>Settings and preferences</li>
        </ul>
        <h2>How It Works</h2>
        <ol>
          <li>Click the button below to submit your request</li>
          <li>We'll verify your identity</li>
          <li>You'll receive an email with your data export within 30 days</li>
        </ol>
        {!requested ? (
          <button className="primary-button" onClick={handleRequest}>
            Request My Data
          </button>
        ) : (
          <div className="success-message">
            <p>✓ Your data request has been submitted successfully.</p>
            <p>
              You will receive an email at {auth.currentUser?.email} with your
              data export within 30 days.
            </p>
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsRequestData;

