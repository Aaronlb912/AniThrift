import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsCommunicationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotionalEmails: true,
    sellerUpdates: true,
    newsletter: false,
    securityAlerts: true,
  });

  const handleToggle = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Communication Preferences</h1>
      <div className="info-content">
        <p>
          Choose how and when you want to receive communications from AniThrift.
        </p>
        <div className="communication-preferences">
          <div className="preference-item">
            <div>
              <h3>Order Updates</h3>
              <p>Receive updates about your orders and shipments</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.orderUpdates}
                onChange={() => handleToggle("orderUpdates")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h3>Promotional Emails</h3>
              <p>Receive emails about special offers and promotions</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.promotionalEmails}
                onChange={() => handleToggle("promotionalEmails")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h3>Seller Updates</h3>
              <p>Receive updates about your listings and sales</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.sellerUpdates}
                onChange={() => handleToggle("sellerUpdates")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h3>Newsletter</h3>
              <p>Subscribe to our monthly newsletter</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={() => handleToggle("newsletter")}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h3>Security Alerts</h3>
              <p>Receive important security and account alerts (recommended)</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.securityAlerts}
                onChange={() => handleToggle("securityAlerts")}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <button className="save-button">Save Preferences</button>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsCommunicationPreferences;

