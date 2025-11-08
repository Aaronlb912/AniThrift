import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import "../css/infoPages.css";

const SettingsDonationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    allowDonations: false,
    donationAmount: 0,
    donationFrequency: "one-time",
  });

  return (
    <MainLayout>
      <div className="info-page-container">
      <h1>Donation Preferences</h1>
      <div className="info-content">
        <p>
          Set up your preferences for making donations through AniThrift.
        </p>
        <div className="donation-settings">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={preferences.allowDonations}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    allowDonations: e.target.checked,
                  })
                }
              />
              Enable donation options
            </label>
          </div>
          {preferences.allowDonations && (
            <>
              <div className="setting-item">
                <label>
                  Default Donation Amount ($)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={preferences.donationAmount}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        donationAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </label>
              </div>
              <div className="setting-item">
                <label>
                  Donation Frequency
                  <select
                    value={preferences.donationFrequency}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        donationFrequency: e.target.value,
                      })
                    }
                  >
                    <option value="one-time">One-time</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
              </div>
            </>
          )}
        </div>
        <button className="save-button">Save Preferences</button>
      </div>
    </div>
    </MainLayout>
  );
};

export default SettingsDonationPreferences;

