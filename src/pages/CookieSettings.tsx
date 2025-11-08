import React, { useState } from "react";
import "../css/infoPages.css";

const CookieSettings: React.FC = () => {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [functional, setFunctional] = useState(true);

  return (
    <div className="info-page-container">
      <h1>Cookie Settings</h1>
      <div className="info-content">
        <p>
          Manage your cookie preferences. You can enable or disable different
          types of cookies below.
        </p>
        <div className="cookie-settings">
          <div className="cookie-setting-item">
            <div>
              <h3>Essential Cookies</h3>
              <p>Required for the website to function properly. Cannot be disabled.</p>
            </div>
            <label className="cookie-toggle">
              <input type="checkbox" checked disabled />
              <span>Always On</span>
            </label>
          </div>
          <div className="cookie-setting-item">
            <div>
              <h3>Analytics Cookies</h3>
              <p>Help us understand how visitors interact with our website.</p>
            </div>
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              <span>{analytics ? "On" : "Off"}</span>
            </label>
          </div>
          <div className="cookie-setting-item">
            <div>
              <h3>Marketing Cookies</h3>
              <p>Used to deliver personalized advertisements.</p>
            </div>
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span>{marketing ? "On" : "Off"}</span>
            </label>
          </div>
          <div className="cookie-setting-item">
            <div>
              <h3>Functional Cookies</h3>
              <p>Enable enhanced functionality and personalization.</p>
            </div>
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={functional}
                onChange={(e) => setFunctional(e.target.checked)}
              />
              <span>{functional ? "On" : "Off"}</span>
            </label>
          </div>
        </div>
        <button className="save-cookie-settings">Save Preferences</button>
      </div>
    </div>
  );
};

export default CookieSettings;

