import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsAdPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    personalizedAds: true,
    thirdPartyAds: false,
  });

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Advertisement Preferences</h1>
      <div className="info-content">
        <p>
          Control how we use your information to show you relevant
          advertisements.
        </p>
        <div className="ad-preferences">
          <div className="preference-item">
            <div>
              <h3>Personalized Ads</h3>
              <p>
                Show me ads based on my interests and browsing history
              </p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.personalizedAds}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    personalizedAds: e.target.checked,
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div>
              <h3>Third-Party Ads</h3>
              <p>Allow third-party advertisers to show you ads</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.thirdPartyAds}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    thirdPartyAds: e.target.checked,
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <button className="save-button">Save Preferences</button>
        <p className="info-note">
          You can also manage your ad preferences through our{" "}
          <a href="/cookie-settings">Cookie Settings</a> page.
        </p>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsAdPreferences;

